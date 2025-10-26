import {TokenService} from "@services/token/token.service.js";
import {EnvironmentService} from "@services/environment/environment.service.js";
import {EmailService} from "@services/email/email.service.js";
import {AuthUserResponse, ErrorIdentifiers, TokenPair} from "@headbase-app/contracts";
import {DatabaseUserDto} from "@modules/users/database/database-user.js";
import {AccessForbiddenError} from "@services/errors/access/access-forbidden.error.js";
import {PasswordService} from "@services/password/password.service.js";
import {AccessUnauthorizedError} from "@services/errors/access/access-unauthorized.error.js";
import {UserRequestError} from "@services/errors/base/user-request.error.js";
import {UserContext} from "@common/request-context.js";
import {EventsService} from "@services/events/events.service.js";
import {EventIdentifiers} from "@services/events/events.js";
import {UsersService} from "@modules/users/users.service.js";


export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
    private readonly envService: EnvironmentService,
    private readonly emailService: EmailService,
    private readonly eventsService: EventsService
  ) {
    // todo: would this be better setup somewhere else?
    this.eventsService.subscribe(EventIdentifiers.USER_CREATE, async (event) => {
      await this.requestEmailVerification(event.detail.user.id)
    })
  }

  async login(email: string, password: string): Promise<AuthUserResponse> {
    let databaseUserDto: DatabaseUserDto;

    try {
      databaseUserDto = await this.usersService._UNSAFE_getByEmail(email);
    }
    catch (e) {
       throw new AccessForbiddenError({
         identifier: ErrorIdentifiers.AUTH_CREDENTIALS_INVALID,
         message: "The supplied email & password combination is invalid.",
         applicationMessage: "The supplied email & password combination is invalid."
       });
    }

    const passwordValid = await PasswordService.checkPassword(password, databaseUserDto.passwordHash);
    if (!passwordValid) {
      throw new AccessForbiddenError({
       identifier: ErrorIdentifiers.AUTH_CREDENTIALS_INVALID,
       message: "The supplied email & password combination is invalid.",
       applicationMessage: "The supplied email & password combination is invalid."
     });
    }

    const userDto = UsersService.convertDatabaseItemToDto(databaseUserDto);
    const result = await this.tokenService.createNewTokenPair(userDto);

    await this.eventsService.dispatch({
      type: EventIdentifiers.AUTH_LOGIN,
      detail: {
        userId: userDto.id,
        sessionId: result.sessionId
      }
    })

    return {
      tokens: result.tokens,
      user: userDto,
    }
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const tokenPayload = await this.tokenService.validateAndDecodeRefreshToken(refreshToken);

    if (!tokenPayload) {
      throw new AccessUnauthorizedError({
        identifier: ErrorIdentifiers.AUTH_TOKEN_INVALID,
        message: "The supplied refresh token is invalid.",
        applicationMessage: "The supplied refresh token is invalid."
      });
    }

    // As the token has been validated the supplied userId/sub value in the token can be trusted in theory
    // If the user isn't found, the user service will throw an error.
    // todo: the user service throwing an error not returning null makes the error handling here unclear.
    const userDto = await this.usersService._UNSAFE_getById(tokenPayload.sub);

    return await this.tokenService.getRefreshedTokenPair(userDto, tokenPayload.sid);
  }

  async logout(refreshToken: string) {
    const tokenPayload = await this.tokenService.validateAndDecodeRefreshToken(refreshToken);

    if (!tokenPayload) {
      throw new UserRequestError({
        identifier: ErrorIdentifiers.AUTH_TOKEN_INVALID,
        applicationMessage: "The refresh token supplied is either invalid or already expired."
      });
    }

    await this.tokenService.blacklistSession(tokenPayload.sid, tokenPayload.exp);

    await this.eventsService.dispatch({
      type: EventIdentifiers.AUTH_LOGOUT,
      detail: {
        userId: tokenPayload.sub,
        sessionId: tokenPayload.sid
      }
    })
  }

  async requestEmailVerification(userId: string) {
    const user = await this.usersService._UNSAFE_getById(userId)
    if (user.verifiedAt) {
      throw new UserRequestError({
        identifier: ErrorIdentifiers.AUTH_NOT_VERIFIED,
        applicationMessage: "The given account has already been verified."
      })
    }

    const verificationToken = await this.tokenService.getActionToken({
      userId: user.id,
      actionType: "verify-email",
      secret: this.envService.vars.auth.emailVerification.secret,
      expiry: this.envService.vars.auth.emailVerification.expiry
    })

    const verificationUrl = `${this.envService.vars.auth.emailVerification.url}#${verificationToken}`

    await this.emailService.sendEmail({
      to: user.email,
      subject: `Account verification for ${this.envService.vars.general.applicationName}`,
      message: `To verify your account you can follow this link: ${verificationUrl}`,
    })
  }

  async verifyEmail(userContext: UserContext, actionToken: string): Promise<AuthUserResponse> {
    const user = await this.usersService._UNSAFE_getById(userContext.id)

    if (user.verifiedAt) {
      throw new UserRequestError({
        identifier: ErrorIdentifiers.AUTH_NOT_VERIFIED,
        applicationMessage: "The given account has already been verified."
      })
    }

    const tokenPayload = await this.tokenService.validateAndDecodeActionToken(actionToken, this.envService.vars.auth.emailVerification.secret)
    if (!tokenPayload) {
      throw new UserRequestError({
        identifier: ErrorIdentifiers.AUTH_TOKEN_INVALID,
        applicationMessage: "The supplied token is invalid."
      })
    }

    if (tokenPayload.sub !== userContext.id) {
      throw new AccessForbiddenError({
        identifier: ErrorIdentifiers.AUTH_NOT_VERIFIED,
        applicationMessage: "The supplied token subject does not match the account requesting the verification."
      })
    }

    const updatedUser = await this.usersService.verifyUser(user.id)
    const result = await this.tokenService.createNewTokenPair(updatedUser)

    return {
      user: updatedUser,
      tokens: result.tokens
    }
  }
}

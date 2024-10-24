import {Application} from "../src/application.js";
import {EnvironmentService} from "@services/environment/environment.service.js";


async function bootstrap() {
  console.debug("[Server] Starting server")
  const application = new Application()
  const server = await application.init()

  const envService = application.getDependency<EnvironmentService>(EnvironmentService);
  server.listen(envService.vars.general.port, () => {
    console.log(`[Server] Listening on http://0.0.0.0:${envService.vars.general.port}`);
  });
}
bootstrap();

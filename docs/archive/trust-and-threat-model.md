# Trust and Threat Model
- Local Device
  - Data is not encrypted at rest to allow for interoperability 
- Server:
  - All data encrypted on device before being sent to server.
  - Acts as the single authority for managing users and controlling authentication/authorization for resources on that server.
  - Trusted to act reliably and not attempt malicious actions against connected devices 

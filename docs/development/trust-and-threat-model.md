# Trust and Threat Model
- Local Device
  - Data is encrypted at rest. 
- Server:
  - All data encrypted on device before being sent to server.
  - Acts as the single authority for managing users and controlling authentication/authorization for resources on the server.
  - Trusted to act reliably and not attempt malicious actions against connected devices 

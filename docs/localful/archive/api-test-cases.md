# API Test Cases
A list of all test cases I can think of for the API.

## Base

### `/ [GET]`
- When a request is made, Then the response should have a 200 status code 
- When a request is made, Then the response should be a string message
- When a request is made without authorization, Then the response should still succeed

### `/v1 [GET]`
- When a request is made, Then the response should have a 200 status code
- When a request is made, Then the response should be a string message
- When a request is made without authorization, Then the response should still succeed

## Auth

### `/v1/auth/login [POST]`
- Authorization:
  - When a request is made without authorization, Then the response should still succeed
  - When a request is made with invalid authorization, Then ??
  - When a request is made with authorization, Then ???
- Main Functionality:
  - Given a known user exists in the database, When a request is made with the correct username & password, Then an access and refresh token should be returned
  - Given a known user exists in the database, When a request is made with the correct username & incorrect password, Then a 40? response should be returned 
  - When a request is made with an incorrect username & incorrect password, Then a 40? response should be returned
- Data Validation:
  - Required Data
    - When sending a request without a username, Then a 400 error should be returned
    - When sending a request without a password, Then a 400 error should be returned
  - Invalid Data:
    - Username
      - When sending a request with the username as a number, Then a 400 error should be returned
      - When sending a request with the username as a boolean, Then a 400 error should be returned
      - When sending a request with the username as null, Then a 400 error should be returned
      - When sending a request with the username as an object, Then a 400 error should be returned
    - Password
      - When sending a request with the password as a number, Then a 400 error should be returned
      - When sending a request with the password as a boolean, Then a 400 error should be returned
      - When sending a request with the password as null, Then a 400 error should be returned
      - When sending a request with the password as an object, Then a 400 error should be returned

### `/v1/auth/logout [POST]`

### `/v1/auth/refresh [POST]`

### `/v1/auth/check [POST]`

## Users

### `/v1/users [POST]`

### `/v1/users/:id [GET]`

### `/v1/users/:id [PATCH]`

### `/v1/users/:id [DELETE]`

## Changes

### `/v1/changes [GET]`

### `/v1/changes/ids [GET]`

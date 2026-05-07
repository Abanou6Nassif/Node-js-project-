# Node.js Stack Overflow Clone API

A clean Express and MongoDB backend for a Stack Overflow style Q&A platform. The project supports user authentication, questions, answers, comments, voting, password reset by OTP, and profile image uploads through Cloudinary.

## Overview

This project provides a REST API for:

- User sign up, login, token refresh, profile update, and password reset
- Creating, reading, updating, and deleting questions
- Posting answers to questions
- Adding, editing, and removing comments on questions and answers
- Upvoting, downvoting, and removing votes on questions and answers
- Admin-only user listing

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing
- Multer for file uploads
- Cloudinary for profile image storage
- Nodemailer for OTP email delivery

## Project Structure

```text
index.js
controller/
middleware/
model/
routes/
uploads/
utils/
```

## Features

- JWT access token and refresh token flow
- Role-based access control with `user` and `admin`
- Profile photo upload during signup and profile update
- Password reset flow using email OTP
- Question search and sorting
- Voting system for questions and answers
- Nested comments on questions and answers

## Prerequisites

- Node.js installed
- MongoDB Atlas access or a reachable MongoDB instance
- Cloudinary account for image uploads
- SMTP email account for OTP delivery

## Installation

```bash
git clone https://github.com/shimaazz/Node-js-project-.git
cd Node-js-project-
npm install
```

## Environment Variables

Create a `.env` file in the project root and add the following values:

```env
PORT=3000
JWT_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret

EMAIL_HOST=smtp.example.com
EMAIL_PORT=465
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_password

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_SECRET_KEY=your_api_secret
```

Notes:

- The app currently connects to a MongoDB Atlas URI inside `index.js`.
- If you want to use another database, update the connection string in `index.js`.
- The `PORT` environment variable is required.

## Run the Project

```bash
npm start
```

The server will start on the port defined in `PORT`.

## Authentication Rules

- Protected endpoints expect the JWT access token in the `Authorization` header.
- The current middleware reads the header value directly, so send the raw token rather than `Bearer <token>`.
- Access tokens expire in 1 hour.
- Refresh tokens expire in 1 year.

## Main Entities

### User

- `userName`
- `email`
- `password`
- `role` (`user` or `admin`)
- `userNumber`
- `profile`

### Question

- `author`
- `title`
- `body`
- `tags`
- `score`
- `votes`
- `comments`

### Answer

- `author`
- `question`
- `body`
- `score`
- `votes`
- `comments`

### Comment

- `author`
- `body`

### Vote

- `user`
- `vote`

## API Base Paths

- `/users`
- `/questions`
- `/answers`
- `/comments`
- `/votes`

## Endpoints

### Users

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/users/signup` | Public | Create a new user and optionally upload a profile photo |
| POST | `/users/login` | Public | Login with email and password |
| POST | `/users/refreshtoken` | Public | Generate a new access token using a refresh token |
| PATCH | `/users/:id` | Authenticated | Update profile data, password, or profile photo |
| DELETE | `/users/:id` | Authenticated | Delete a user account |
| POST | `/users/forgotpassword` | Public | Send OTP to email for password reset |
| POST | `/users/resetpassword` | Public | Reset password using OTP |
| GET | `/users` | Admin only | Get all users |
| GET | `/users/:id` | Public | Get a single user by ID |

#### Signup

`POST /users/signup`

Send as `multipart/form-data`.

Fields:

- `userName`
- `email`
- `password`
- `role` optional, defaults to `user`
- `profilePhoto` optional file field

Example:

```bash
curl -X POST http://localhost:3000/users/signup \
	-F "userName=John Doe" \
	-F "email=john@example.com" \
	-F "password=Password123" \
	-F "role=user" \
	-F "profilePhoto=@./avatar.png"
```

#### Login

`POST /users/login`

Body:

```json
{
	"email": "john@example.com",
	"password": "Password123"
}
```

Returns:

- access token
- refresh token

#### Refresh Token

`POST /users/refreshtoken`

Body:

```json
{
	"refresh": "your_refresh_token"
}
```

#### Update User

`PATCH /users/:id`

Send with the `Authorization` header and optionally `multipart/form-data`.

Possible fields:

- `userName`
- `password`
- `oldPassword`
- `removeProfile` to remove the current profile image
- `profilePhoto` file field

#### Forgot Password

`POST /users/forgotpassword`

Body:

```json
{
	"email": "john@example.com"
}
```

An OTP is emailed to the user and is valid for 15 minutes.

#### Reset Password

`POST /users/resetpassword`

Body:

```json
{
	"email": "john@example.com",
	"otp": "123456",
	"newPassword": "NewPassword123"
}
```

### Questions

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/questions` | Authenticated | Create a question |
| GET | `/questions` | Public | List questions with search and sorting |
| GET | `/questions/:id` | Public | Get a single question with its answers |
| PUT | `/questions/:id` | Authenticated, author only | Update a question |
| DELETE | `/questions/:id` | Authenticated, author only | Delete a question |

#### Create Question

`POST /questions`

Body:

```json
{
	"title": "How do I connect Node.js to MongoDB?",
	"body": "I need help setting up my first connection.",
	"tags": ["nodejs", "mongodb", "mongoose"]
}
```

#### List Questions

`GET /questions?search=node&sort=latest`

Query params:

- `search` filters by title text
- `sort=latest` sorts by newest first
- `sort=votes` sorts by score descending

#### Single Question

`GET /questions/:id`

Returns the question and its answers.

#### Update Question

`PUT /questions/:id`

Body can include any of:

- `title`
- `body`
- `tags`

#### Delete Question

`DELETE /questions/:id`

### Answers

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/answers/:questId` | Public | Get all answers for a question |
| POST | `/answers/:questId` | Authenticated | Add an answer to a question |
| PATCH | `/answers/:questId/:answerId` | Authenticated, author only | Edit an answer |
| DELETE | `/answers/:questId/delete/:answerId` | Authenticated, author only | Delete an answer |

#### Add Answer

`POST /answers/:questId`

Body:

```json
{
	"body": "Use Mongoose's connect method with your Atlas URI."
}
```

#### Edit Answer

`PATCH /answers/:questId/:answerId`

Body:

```json
{
	"body": "Updated answer text"
}
```

### Comments

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/comments/:type/:id` | Authenticated | Add a comment to a question or answer |
| GET | `/comments/:type/:id` | Public | Get comments for a question or answer |
| PATCH | `/comments/:type/:parentId/:commentId` | Authenticated, owner only | Update a comment |
| DELETE | `/comments/:type/:parentId/:commentId` | Authenticated, owner only | Delete a comment |

`type` must be either `question` or `answer`.

#### Add Comment

`POST /comments/question/:id`

or

`POST /comments/answer/:id`

Body:

```json
{
	"body": "This helped me a lot. Thanks!"
}
```

### Votes

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/votes/:id/vote` | Authenticated | Vote on a question |
| POST | `/votes/:questionId/answers/:answerId/vote` | Authenticated | Vote on an answer |

Vote values:

- `1` for upvote
- `-1` for downvote
- `0` to remove an existing vote

Example body:

```json
{
	"vote": 1
}
```

## Request Examples

### Authenticated Request

```bash
curl -X GET http://localhost:3000/questions \
	-H "Authorization: your_jwt_access_token"
```

### Create a Question

```bash
curl -X POST http://localhost:3000/questions \
	-H "Authorization: your_jwt_access_token" \
	-H "Content-Type: application/json" \
	-d '{
		"title": "What is JWT?",
		"body": "I need a short explanation of JWT.",
		"tags": ["auth", "jwt"]
	}'
```

### Add a Comment

```bash
curl -X POST http://localhost:3000/comments/question/QUESTION_ID \
	-H "Authorization: your_jwt_access_token" \
	-H "Content-Type: application/json" \
	-d '{
		"body": "Great question."
	}'
```

## Common Responses

- `200 OK` for successful reads and updates
- `201 Created` for new resources
- `204 No Content` for successful deletes
- `400 Bad Request` for validation problems
- `401 Unauthorized` for missing or invalid tokens
- `403 Forbidden` for role or ownership checks
- `404 Not Found` when a resource does not exist
- `500 Internal Server Error` for unexpected failures

## Notes

- Profile photos are uploaded locally first and then pushed to Cloudinary.
- Passwords are hashed with bcrypt before saving.
- OTP-based password reset codes expire after 15 minutes.
- Question and answer voting updates the stored score and keeps one vote per user.

## License

This project is published under the ISC license.
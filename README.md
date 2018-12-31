# qtime (Personal Project - In Progress)
A RESTful API for qtime. qtime is a question giving platform that can be used by instructors to deploy questions in a
virtual classroom in real-time. Students can answer those questions and be marked. It uses Node.js, Express.js, MongoDB, and Socket.io.

Currently the following is implemented:
- Authentication: Instructors/Students authenticate using Firebase Authentication (Authorization Server), Firebase sends back an access
token and a refresh token. The client can use this access token (which is a JWT) to make API requests. 
- Instructors can create courses, create questions within the courses, deploy a question in the classroom, and close the classroom.
- Students can join courses by using a join code, answer a question that is currently deployed in the classroom, and recieve their marks
after the classroom is closed.
- It is deployed on AWS using an EC2 instance.

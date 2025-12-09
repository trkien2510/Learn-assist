# API Endpoints Summary

> **Base URL**: `/api`  

---

## 1. Authentication (`/auth`) - 3 endpoints

| Method | Endpoint | Function |
|--------|----------|----------|
| POST | `/register` | Register new account |
| POST | `/login` | Login, returns access_token and refresh_token |
| POST | `/refresh-token` | Refresh access token |

---

## 2. User (`/user`) - 3 endpoints

| Method | Endpoint | Function |
|--------|----------|----------|
| GET | `/me` | Get current user profile |
| PUT | `/profile` | Update current user profile |
| POST | `/deactivate` | Deactivate current user account |

---

## 3. Classroom (`/classroom`) - 12 endpoints

### Classroom CRUD

| Method | Endpoint | Function |
|--------|----------|----------|
| POST | `/create` | Create new classroom (teachers only) |
| GET | `/all` | Get classrooms based on user role |
| GET | `/{class_code}/members` | Get classroom members and pending requests |
| DELETE | `/{class_code}` | Delete classroom |

### Join Requests

| Method | Endpoint | Function |
|--------|----------|----------|
| GET | `/pending-requests` | Get all pending requests from owned classrooms (teachers only) |
| POST | `/{class_code}/join-request` | Send join request |
| POST | `/{class_code}/accept/{request_id}` | Accept a join request |
| POST | `/{class_code}/accept-all` | Accept all join requests |
| POST | `/{class_code}/reject/{request_id}` | Reject a join request |
| POST | `/{class_code}/reject-all` | Reject all join requests |

### Member Management

| Method | Endpoint | Function |
|--------|----------|----------|
| POST | `/{class_code}/leave` | Leave classroom |
| DELETE | `/{class_code}/members/{member_id}` | Remove member from classroom |

---

## 4. Document (`/document`) - 4 endpoints

| Method | Endpoint | Function |
|--------|----------|----------|
| GET | `/all` | Get documents based on user role |
| POST | `/upload/{number_question}` | Upload document and generate questions with AI |
| POST | `/save-questions` | Save AI-generated questions |
| DELETE | `/{document_id}` | Delete document |

---

## 5. Question (`/question`) - 6 endpoints

| Method | Endpoint | Function |
|--------|----------|----------|
| POST | `/create` | Create new question |
| GET | `/all` | Get questions based on user role |
| GET | `/subject/list` | Get available subjects |
| GET | `/{question_id}` | Get question details |
| PUT | `/{question_id}` | Update question |
| DELETE | `/{question_id}` | Delete question |

---

## 6. Exam (`/exam`) - 6 endpoints

### Exam CRUD

| Method | Endpoint | Function |
|--------|----------|----------|
| POST | `/create` | Create new exam (teachers only) |
| GET | `/all` | Get all exams based on user role |
| GET | `/class/{class_id}` | Get exams by classroom |
| DELETE | `/{exam_id}` | Delete exam (creator only) |

### Exam Flow

| Method | Endpoint | Function |
|--------|----------|----------|
| POST | `/{exam_id}/start` | Start exam, creates Result to track time |
| POST | `/{exam_id}/submit` | Submit exam, calculates score |

**Exam Flow:**
1. `POST /{exam_id}/start` → Returns exam info, result_id, time_remaining
2. `POST /{exam_id}/submit` → Send `{"answers": {"question_id": "A", ...}}` → Returns score

---

## 7. Result (`/result`) - 4 endpoints

| Method | Endpoint | Function |
|--------|----------|----------|
| GET | `/all` | Get all results based on user role |
| GET | `/exam/{exam_id}` | Get results by exam |
| GET | `/class/{class_id}` | Get results by classroom |
| DELETE | `/{result_id}` | Delete result |

---

## 8. Statistics (`/statistics`) - 2 endpoints

| Method | Endpoint | Function |
|--------|----------|----------|
| GET | `/exam/{exam_id}` | Get statistics by exam |
| GET | `/class/{class_id}` | Get statistics by classroom |

---

## 9. Dashboard (`/dashboard`) - 1 endpoint

| Method | Endpoint | Function |
|--------|----------|----------|
| GET | `/` | Get dashboard statistics based on user role |

**Response by role:**
- **Admin**: `total_users`, `total_classrooms`, `total_documents`, `total_exams`, `total_questions`
- **Teacher**: `total_classrooms`, `total_documents`, `total_questions`, `total_exams`, `total_students`
- **Student**: `total_classrooms`, `total_exams_taken`, `average_score`

---

## 10. Notifications (`/notifications`) - 5 endpoints

| Method | Endpoint | Function |
|--------|----------|----------|
| GET | `/` | Get notifications for current user (paginated, supports unread_only filter) |
| GET | `/unread-count` | Get count of unread notifications |
| POST | `/mark-read` | Mark notifications as read (specific IDs or all) |
| DELETE | `/{notification_id}` | Delete a specific notification |
| DELETE | `/` | Delete all notifications for current user |

**Notification Types:**
- `exam_created`: New exam created in student's class
- `exam_started`: Exam has started
- `exam_ended`: Exam has ended
- `exam_result`: Exam results available
- `document_upload_success/failed`: Document upload status
- `exam_creation_success`: Exam created successfully
- `exam_statistics_available`: Exam statistics ready
- `system_error/warning`: System alerts (admin only)
- `user_anomaly`: User behavior anomaly detected
- `high_error_rate`: High API error rate alert

---

## 11. Admin (`/admin`) - 16 endpoints (Admin Only)

### User Management (`/admin/users`)

| Method | Endpoint | Function |
|--------|----------|----------|
| GET | `/` | Get all users (paginated) |
| GET | `/{user_id}` | Get user details |
| PUT | `/{user_id}` | Update user information |
| DELETE | `/{user_id}` | Delete user |
| PATCH | `/{user_id}/status` | Activate/Deactivate user |

### Classroom Management (`/admin/classroom`)

| Method | Endpoint | Function |
|--------|----------|----------|
| GET | `/{classroom_id}` | Get classroom details |
| PUT | `/{classroom_id}` | Update classroom information |
| DELETE | `/{classroom_id}` | Delete classroom |

### Log Management (`/admin/logs`)

| Method | Endpoint | Function |
|--------|----------|----------|
| GET | `/` | Get logs with filters (action, user_id, resource_type, status, from_date, to_date) |
| GET | `/statistics` | Get log statistics (total, success, error, 24h, 7d) |
| GET | `/{log_id}` | Get log details |
| DELETE | `/cleanup` | Delete old logs (default 30 days) |

### Notification Management (`/admin/notifications`)

| Method | Endpoint | Function |
|--------|----------|----------|
| GET | `/system-notifications` | Get system notifications for admin |
| GET | `/system-health` | Check system health and detect anomalies |
| POST | `/cleanup-notifications` | Cleanup old notifications (default 30 days) |
| POST | `/test-notification` | Send a test notification to verify system |

---

## Role Permissions

| Role | Access |
|------|--------|
| `admin` | Full access to all endpoints |
| `teacher` | Create classrooms, exams, questions; manage owned classrooms |
| `student` | Join classrooms, take exams, view own results |

---

## Statistics

| Module | Endpoints |
|--------|----------|
| Auth | 3 |
| User | 3 |
| Classroom | 12 |
| Document | 4 |
| Question | 6 |
| Exam | 6 |
| Result | 4 |
| Statistics | 2 |
| Dashboard | 1 |
| Notifications | 5 |
| Admin | 16 |
| **Total** | **62** |

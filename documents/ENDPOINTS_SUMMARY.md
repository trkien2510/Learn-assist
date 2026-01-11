# API Endpoints Summary

> **Base URL**: `/api`  

---

## 1. Authentication (`/auth`) - 10 endpoints

| Method | Endpoint | Function |
|--------|----------|----------|
| POST | `/add-user/for-test` | Add user for testing (bypass OTP) |
| POST | `/register` | Register new account |
| POST | `/login` | Login, returns access_token and refresh_token |
| POST | `/refresh-token` | Refresh access token |
| POST | `/otp/request` | Request registration OTP |
| POST | `/otp/verify` | Verify registration OTP |
| POST | `/forgot-password` | Request forgot password OTP |
| POST | `/reset-password` | Reset password with OTP |
| POST | `/reactivate/request` | Request account reactivation OTP |
| POST | `/reactivate/verify` | Verify and reactivate account |

---

## 2. User (`/user`) - 4 endpoints

| Method | Endpoint | Function |
|--------|----------|----------|
| GET | `/me` | Get current user profile |
| PUT | `/profile` | Update current user profile |
| POST | `/change-password` | Change current user password |
| DELETE | `/delete` | Delete current user account |

---

## 3. Classroom (`/classroom`) - 13 endpoints

### Classroom CRUD

| Method | Endpoint | Function |
|--------|----------|----------|
| POST | `/create` | Create new classroom (teachers only) |
| GET | `/all` | Get classrooms based on user role |
| GET | `/{class_code}` | Get classroom details |
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
| POST | `/save-questions/{document_id}` | Save AI-generated questions |
| DELETE | `/{document_id}` | Delete document |

---

## 5. Question (`/question`) - 6 endpoints

| Method | Endpoint | Function |
|--------|----------|----------|
| POST | `/create` | Create new question |
| GET | `/all` | Get questions based on user role (supports search, difficulty filter) |
| GET | `/subject/list` | Get available subjects |
| GET | `/{question_id}` | Get question details |
| PUT | `/{question_id}` | Update question |
| DELETE | `/{question_id}` | Delete question |

---

## 6. Exam (`/exam`) - 10 endpoints

### Exam CRUD

| Method | Endpoint | Function |
|--------|----------|----------|
| POST | `/create` | Create new exam (teachers only) |
| POST | `/preview` | Preview questions before creating exam |
| POST | `/replace-question` | Replace a question in preview |
| GET | `/all` | Get all exams based on user role |
| GET | `/class/{class_id}` | Get exams by classroom |
| GET | `/{exam_id}` | Get exam details |
| DELETE | `/{exam_id}` | Delete exam (creator only) |

### Exam Flow

| Method | Endpoint | Function |
|--------|----------|----------|
| POST | `/{exam_id}/start` | Start exam, creates Result to track time |
| POST | `/{exam_id}/submit` | Submit exam, calculates score |
| POST | `/{exam_id}/save-answers` | Save progress during exam |

---

## 7. Result (`/result`) - 4 endpoints

| Method | Endpoint | Function |
|--------|----------|----------|
| GET | `/all` | Get all results based on user role |
| GET | `/exam/{exam_id}` | Get results by exam |
| GET | `/class/{class_id}` | Get results by classroom |
| DELETE | `/{result_id}` | Delete result |

---

## 8. Statistics (`/statistics`) - 10 endpoints

| Method | Endpoint | Function |
|--------|----------|----------|
| GET | `/exam/{exam_id}` | Get statistics by exam |
| GET | `/class/{class_id}` | Get statistics by classroom |
| GET | `/personal` | Get personal practice results |
| GET | `/comprehensive` | Get comprehensive statistics (role-based) |
| GET | `/student/comprehensive` | Get student comprehensive statistics |
| GET | `/teacher/comprehensive` | Get teacher comprehensive statistics |
| GET | `/exam/{exam_id}/detailed` | Get detailed exam statistics |
| GET | `/class/{class_id}/detailed` | Get detailed classroom statistics |
| GET | `/platform` | Get platform statistics (admin only) |
| GET | `/overall` | Get user overall statistics |

---

## 9. Dashboard (`/dashboard`) - 1 endpoint

| Method | Endpoint | Function |
|--------|----------|----------|
| GET | `` | Get dashboard statistics based on user role |

**Response by role:**
- **Admin**: `total_users`, `total_classrooms`, `total_documents`, `total_exams`, `total_questions`, `recent_activities`
- **Teacher**: `total_classrooms`, `total_documents`, `total_questions`, `total_exams`, `total_students`, `recent_activities`
- **Student**: `total_classrooms`, `total_exams_taken`, `average_score`, `recent_activities`

---

## 10. Notifications (`/notifications`) - 5 endpoints

| Method | Endpoint | Function |
|--------|----------|----------|
| GET | `/` | Get notifications for current user (paginated, supports unread_only filter) |
| GET | `/unread-count` | Get count of unread notifications |
| POST | `/mark-read` | Mark notifications as read (specific IDs or all) |
| DELETE | `/{notification_id}` | Delete a specific notification |
| DELETE | `/` | Delete all notifications for current user |

---

## 11. Messages (`/message`) - 2 endpoints

| Method | Endpoint | Function |
|--------|----------|----------|
| POST | `/{class_code}/send` | Send message to classroom |
| GET | `/{class_code}/messages` | Get classroom messages |

---

## 12. Practice (`/practice`) - 9 endpoints

| Method | Endpoint | Function |
|--------|----------|----------|
| POST | `/exam/create` | Create personal practice exam |
| GET | `/exams` | Get personal exams list |
| POST | `/exam/{exam_id}/start` | Start personal exam |
| POST | `/exam/{exam_id}/submit` | Submit personal exam |
| DELETE | `/exam/{exam_id}` | Delete personal exam |
| GET | `/statistics` | Get personal exam statistics |
| GET | `/statistics/detailed` | Get detailed practice statistics |
| GET | `/exam/{exam_id}/statistics` | Get personal exam detailed statistics |
| GET | `/documents/statistics` | Get document statistics |

---

## 13. Admin (`/admin`) - 21 endpoints (Admin Only)

### User Management (`/admin/users`)

| Method | Endpoint | Function |
|--------|----------|----------|
| GET | `/` | Get all users (paginated, supports role/status/search filters) |
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
| GET | `/` | Get logs with filters (action, user_id, resource_type, status) |
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

### Statistics Management (`/admin/stats`)

| Method | Endpoint | Function |
|--------|----------|----------|
| GET | `/statistics` | Get admin statistics |
| GET | `/users/{user_id}/activity` | Get user activity timeline |
| GET | `/system/health` | Get system health metrics |
| GET | `/analytics/user-growth` | Get user growth stats |
| GET | `/analytics/activity-heatmap` | Get activity heatmap |

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
| Auth | 10 |
| User | 4 |
| Classroom | 13 |
| Document | 4 |
| Question | 6 |
| Exam | 10 |
| Result | 4 |
| Statistics | 10 |
| Dashboard | 1 |
| Notifications | 5 |
| Messages | 2 |
| Practice | 9 |
| Admin | 21 |
| **Total** | **99** |

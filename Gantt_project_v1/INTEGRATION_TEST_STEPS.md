# Holiday-Aware Date Calculation - Integration Test Steps

## Prerequisites
1. Ensure PostgreSQL is running on localhost:5432
2. Create database `gantt_project_db` if not exists
3. Run the database setup scripts in this order:
   - `holidays_setup.sql`
   - `holidays_insertions.sql`
   - Other setup scripts as needed

## Backend Testing Steps

### 1. Start the Spring Boot Application
```bash
cd /home/abd_faiyaz/ontik_project_1/Gantt_project_v1
mvn spring-boot:run
```

### 2. Test Holiday Endpoints
```bash
# Get all holidays
curl -X GET "http://localhost:8080/holidays" | jq

# Check if a date is a holiday
curl -X GET "http://localhost:8080/holidays/check?date=2025-07-04" | jq

# Check if a date is a working day
curl -X GET "http://localhost:8080/holidays/working-day?date=2025-07-04" | jq
```

### 3. Test Date Calculation Endpoints
```bash
# Calculate end date (3 working days from start)
curl -X POST "http://localhost:8080/tasks/calculate-end-date" \
  -H "Content-Type: application/json" \
  -d '{"startDate": "2025-07-03", "estimateDays": 3}' | jq

# Validate end date
curl -X GET "http://localhost:8080/tasks/validate-end-date?startDate=2025-07-03&estimateDays=3&selectedEndDate=2025-07-08" | jq
```

## Frontend Testing Steps

### 1. Start the React Development Server
```bash
cd /home/abd_faiyaz/ontik_project_1/Gantt_project_v1/src/main/resources/static/React_Frontend/frontend
npm install
npm start
```

### 2. Test TaskForm Integration
1. Navigate to the task creation form
2. Select a start date (e.g., July 3, 2025 - day before Independence Day)
3. Enter an estimate (e.g., 3 days)
4. Verify that:
   - End date is auto-calculated (should be July 8, 2025, skipping July 4 holiday and weekend)
   - July 4 appears in red in the calendar
   - End date selection is restricted to calculated date or later
   - Validation messages appear for invalid selections

### 3. Test Calendar Features
1. Open the start/end date calendars
2. Verify holidays appear in red
3. Verify weekends are styled differently
4. Verify disabled dates cannot be selected
5. Check the legend shows correctly

## Expected Behavior

### Working Day Calculation
- Weekends (Saturday/Sunday) are excluded
- Non-working holidays are excluded
- Working holidays are included in calculation

### Calendar Display
- Holidays marked in red with indicators
- Weekends styled differently
- Disabled dates grayed out
- Clear legend showing color meanings

### Validation
- End date must be on or after calculated date
- Clear error messages for invalid selections
- Auto-calculation when start date or estimate changes

## Common Issues and Solutions

### Backend Issues
1. **Database Connection**: Ensure PostgreSQL is running and credentials are correct
2. **Missing Holidays**: Run `holidays_insertions.sql` script
3. **CORS Errors**: Verify WebConfig allows frontend origin

### Frontend Issues
1. **API Connection**: Check proxy setting in package.json
2. **Calendar Not Loading**: Verify HolidayService endpoints are reachable
3. **Date Calculation**: Check browser console for API errors

## Performance Considerations
- Holiday data is cached on frontend after first load
- Date calculations are performed server-side for accuracy
- Calendar renders efficiently with proper date range limiting

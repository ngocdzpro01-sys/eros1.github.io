New feature: Owner - Edit & Delete Hotel

Whats added
- Backend:
  - GET /api/hotels/owner (protected) -> returns the owners hotel
  - PUT /api/hotels/:id (protected) -> update hotel fields (name, address, contact, city)
  - DELETE /api/hotels/:id (protected) -> delete hotel and cascade delete Rooms and Bookings
- Frontend (Owner -> ListRoom page)
  - Displays hotel info at top of list page
  - "Chỉnh sửa" opens a modal to edit name/address/contact/city and saves via PUT
  - "Xóa" shows confirmation and calls DELETE (also clears local rooms state)

How to test manually
1. Log in as owner on frontend (the owner user must exist and have a hotel). 
2. Visit /owner/list-room (ListRoom page). You should see hotel card with Edit and Delete.
3. Edit: click Chỉnh sửa, change fields, click Lưu. Expect a success toast and updated card.
4. Delete: click Xóa, confirm. Expect a success toast, hotel card removed, rooms list cleared.
5. Backend: use GET /api/hotels/owner to fetch current hotel; PUT and DELETE endpoints are protected and require Authorization Bearer token (use Clerk token from the frontend or backend). 

Notes
- Owner authentication is enforced via existing `protect` middleware. Only the hotel owner can edit or delete their hotel.
- Deleting the hotel also deletes associated Rooms and Bookings in the database.
- Further improvements can include image support, soft-delete, or undo for delete. If you want one of these, tell me which and I will add it.

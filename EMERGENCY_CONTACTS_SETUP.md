# User Emergency Contacts Feature

## Overview
Users can now manage their own personal emergency contacts directly from their profile page. These contacts are separate from the admin-managed company-wide emergency contacts.

## Database Setup

### New Table: `user_emergency_contacts`

Run this SQL in your Supabase SQL Editor:

```sql
-- User emergency contacts table (for individual users to manage their personal contacts)
CREATE TABLE IF NOT EXISTS user_emergency_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    relationship VARCHAR(100),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_user_emergency_contacts_user_id ON user_emergency_contacts(user_id);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_user_emergency_contacts_updated_at BEFORE UPDATE ON user_emergency_contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Note**: If you've already run the main schema, you can run just this migration from `server/user-emergency-contacts-migration.sql`

## Features

### User Profile Page
- Click "Emergency Contacts" button to open the contacts modal
- View all personal emergency contacts
- Add new contacts with:
  - Name (required)
  - Phone number
  - Email
  - Relationship (Family, Friend, Colleague, etc.)
  - Primary contact flag
- Edit existing contacts
- Delete contacts
- Set primary contact (only one can be primary at a time)

### API Endpoints

All endpoints require authentication:

- `GET /api/profile/emergency-contacts` - Get user's contacts
- `POST /api/profile/emergency-contacts` - Create new contact
- `PUT /api/profile/emergency-contacts/:id` - Update contact
- `DELETE /api/profile/emergency-contacts/:id` - Delete contact

## Usage

1. **Access**: Go to Profile → Account Settings → Emergency Contacts
2. **Add Contact**: Fill in the form at the bottom of the modal and click "Add Contact"
3. **Edit Contact**: Click the edit icon on any contact card
4. **Delete Contact**: Click the delete icon and confirm
5. **Set Primary**: Check "Set as primary contact" when adding/editing

## Data Structure

Each contact includes:
- `id` - Unique identifier
- `user_id` - Owner of the contact
- `name` - Contact name (required)
- `email` - Email address (optional)
- `phone` - Phone number (optional)
- `relationship` - Relationship type (optional)
- `is_primary` - Primary contact flag
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## Security

- Users can only view/edit/delete their own contacts
- Backend validates ownership before any operation
- Contacts are automatically deleted when user account is deleted (CASCADE)

## Future Enhancements

- Integrate user contacts into SOS alert notifications
- Allow users to import contacts from phone
- Add contact groups/categories
- Quick call functionality from profile


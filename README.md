# n8n-nodes-servicem8

This is an n8n community node. It lets you use ServiceM8 in your n8n workflows.

ServiceM8 is a job management software designed for small service businesses, helping them streamline scheduling, quoting, invoicing, and communication. It enables field staff to access job details, capture information, and process payments on-site via a mobile app.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Compatibility](#compatibility)
[Usage](#usage)
[Resources](#resources)
[Version history](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

### Attachment
- **Upload** - Upload a file and create an attachment record
- **Get** - Get attachment metadata with optional file download
- **Get Many** - Get multiple attachments for a job or client
- **Delete** - Soft delete an attachment

### Client
- **Create** - Create a new client
- **Get** - Get client details
- **Get Many** - Get multiple clients
- **Update** - Update client details
- **Delete** - Delete client
- **Update Client Contacts** - Update client contact details

### Job
- **Create** - Create new job
- **Create From Template** - Create job from template
- **Get** - Get job details
- **Get Many** - Get multiple jobs
- **Update** - Update job details
- **Delete** - Delete job
- **Add Note To Job** - Add job note
- **Send Job To Queue** - Queue job
- **Update Job Contacts** - Update job contact details

### Job Booking
- **Create** - Create a job booking
- **Get** - Get booking details
- **Get Many** - Get multiple bookings
- **Update** - Update booking details
- **Delete** - Delete booking

### Job Checkin
- **Get** - Get job checkin details
- **Get Many** - Get multiple job checkins

### Inbox
- **Create** - Create inbox message
- **Get** - Get inbox message details
- **Get Many** - Get multiple inbox messages
- **Convert To Job** - Convert inbox message to a job

### Email
- **Send** - Send email

### SMS
- **Send** - Send text message

### Search
- **Global Search** - Search everything
- **Object Search** - Search specific type

### Webhook Trigger
Available webhook events:
- Badge Added to Job
- Badge Removed From Job
- Customer Accepted the Quote
- Customer Details Updated
- Customer Review Submitted
- Form Response Submitted
- Full Payment Received for Invoice
- Invoice Sent to Customer
- Job Added to Queue
- Job Details Modified
- Job Marked as Completed
- Job Status Changed
- New Customer Added
- New Job Created in the System
- New Message Received in Inbox
- Note Added to Job
- Photo Attached to Job
- Proposal Sent to Customer
- Proposal Viewed by Customer
- Quote Sent to Customer

## Credentials

This node supports two authentication methods:

### API Key Authentication 
1. Log in to your ServiceM8 account
2. Navigate to **Settings** > **API Keys**
3. Click **Generate API Key**
4. Copy your API key and account email
5. In n8n, create new ServiceM8 credentials with your email and API key

## Compatibility

Tested with n8n v1.110.0 and later.

## Usage

### Create Job from Web Form
This example shows how to create a new job when a web form is submitted:

1. Set up a Webhook trigger to receive form submissions
2. Use the Company node to create or find the customer
3. Use the Job node to create a new job for that customer

### Daily Schedule Email
This example shows how to email tomorrow's schedule to staff:

1. Set up a Schedule trigger to run daily
2. Use the Activity node to list tomorrow's activities
3. Use an Email node to send the schedule

For detailed usage examples and field mapping information, refer to the ServiceM8 API documentation.

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes)
* [ServiceM8 API Documentation](https://developer.servicem8.com/docs)
* [ServiceM8 Developer Forum](https://developer.servicem8.com/discuss)
* [GitHub Issues](https://github.com/servicem8/n8n-nodes-servicem8/issues)

## Version history

### 0.1.5
**New Resources:**
- **Attachment** - Full support for file attachments
  - Upload files to jobs or clients with automatic metadata handling
  - Get attachment metadata with optional binary file download
  - Get multiple attachments with filtering support
  - Delete attachments
- **Job Booking** - Full support for job allocations (flexible time) and job activities (fixed time)
- **Job Checkin** - Get and list job checkin records

**New Operations:**
- **Client**: Create, Update, Delete, Update Client Contacts
- **Job**: Update Job Contacts
- **Inbox**: Get, Get Many, Convert To Job

**Enhancements:**
- Client and Job Get/Get Many now support optional contact inclusion
- Get Many operations support pagination (limit) and advanced filtering
- Attachment Get Many supports filtering by attachment name, file type, source, tags, and more
- "Include Inactive Records" moved to Advanced Options section for cleaner UI
- Job Create now uses a cleaner UI with required Status field and dynamic field picker
- Readonly fields (uuid, edit_date, created_by_staff_uuid, etc.) are now excluded from create/update field pickers but remain available for filtering
- Job Template dropdowns now filter to show only active templates with valid names
- Improved UI consistency across all resources (standardised field labels and action names)
- Refactored to handler-based architecture for better maintainability

### 0.1.4
- Added Inbox resource with create message action

### 0.1.0
Initial release of the ServiceM8 node with support for:
- Jobs management
- Customer (Company) management
- Webhook triggers

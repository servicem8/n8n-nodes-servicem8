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

### Client (Customer)
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

### Email
- **Send Email** - Send email

### Inbox
- **Create Inbox Message** - Create inbox message
- **Get** - Get inbox message details
- **Get Many** - Get multiple inbox messages
- **Convert To Job** - Convert inbox message to a job

### SMS
- **Send SMS** - Send text message

### Search
- **Global Search** - Search everything
- **Search** - Search specific type

### Job Checkin
- **Get** - Get job checkin details
- **Get Many** - Get multiple job checkins

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
- **Job Booking** - Full CRUD support for job allocations (flexible time) and job activities (fixed time)
- **Job Checkin** - Get and list job checkin records

**New Operations:**
- **Client**: Create, Update, Delete, Update Client Contacts
- **Job**: Update Job Contacts
- **Inbox**: Get, Get Many, Convert To Job

**Enhancements:**
- Client and Job Get/Get Many now support optional contact inclusion
- Get Many operations support pagination (limit) and inactive record filtering
- Job Create now uses a cleaner UI with required Status field and dynamic field picker
- Refactored to handler-based architecture for better maintainability

### 0.1.4
- Added Inbox resource with create message action

### 0.1.0
Initial release of the ServiceM8 node with support for:
- Jobs management
- Customer (Company) management
- Webhook triggers

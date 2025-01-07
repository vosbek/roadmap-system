// Organization and hierarchy template
export const enterpriseSystemTemplate = `organization_name,organization_description,organization_contact_info,area_name,area_description,team_name,team_description,architect_name,architect_email,architect_contact_info,application_name,application_description,application_status,application_enterprise_id,subsystem_name,subsystem_description,subsystem_enterprise_id,subsystem_type,subsystem_status,capability_name,capability_description,capability_type,capability_status
Tech Division,Technology Division Group,tech.support@company.com,Infrastructure,Core Infrastructure Services,Cloud Platform,Cloud Infrastructure Team,John Smith,john.smith@company.com,555-0123,Customer Portal,Customer facing web portal,active,CP-001,Authentication Service,Authentication and authorization system,1710,web,active,SSO Integration,Single sign-on capability,security,active
Tech Division,Technology Division Group,tech.support@company.com,Infrastructure,Core Infrastructure Services,Cloud Platform,Cloud Infrastructure Team,John Smith,john.smith@company.com,555-0123,Customer Portal,Customer facing web portal,active,CP-001,Payment Processing,Payment gateway integration,1711,batch,active,Payment Gateway,Payment processing capability,financial,active
Tech Division,Technology Division Group,tech.support@company.com,Security,Enterprise Security Services,Security Ops,Security Operations Team,Sarah Johnson,sarah.johnson@company.com,555-0124,Trading Platform,Trading and order management,active,TP-001,Order Management,Order processing system,1712,web,active,Order Validation,Order validation rules,business,active
Tech Division,Technology Division Group,tech.support@company.com,Security,Enterprise Security Services,Security Ops,Security Operations Team,Sarah Johnson,sarah.johnson@company.com,555-0124,Trading Platform,Trading and order management,active,TP-001,Market Data Feed,Real-time market data,1713,batch,active,Data Streaming,Real-time data streaming,integration,active
Tech Division,Technology Division Group,tech.support@company.com,Digital,Digital Services Group,Digital Banking,Digital Banking Solutions,Michael Chen,michael.chen@company.com,555-0125,Risk System,Risk assessment platform,active,RS-001,Calculation Engine,Risk calculation system,1714,mainframe,active,Risk Analytics,Risk calculation algorithms,analytics,active`;

// Projects and relationships template
export const projectTemplate = `project_name,project_title,project_type,project_description,start_date,end_date,status,project_type,is_shared,owner_architect_email,owner_team_name,subscribed_team_names,dependency_project_ids,subsystem_enterprise_ids,custom_start_dates,custom_end_dates,notes
Authentication Upgrade,Authentication System Upgrade,infrastructure,Implement SSO and MFA,2024-01-01,2024-03-31,in_progress,infrastructure,false,john.smith@company.com,Cloud Platform,Security Ops|Digital Banking,PRJ-002,1710|1711,2024-01-15|2024-02-01,2024-03-15|2024-03-31,Auth system upgrade|Payment integration
Payment Gateway Migration,Payment System Migration,infrastructure,Migrate to new payment provider,2024-02-01,2024-05-31,planned,infrastructure,true,john.smith@company.com,Cloud Platform,Digital Banking,PRJ-003,1711,2024-02-15,2024-05-15,Payment system migration
Real-time Analytics,Trading Analytics Implementation,innovation,Implement real-time trading analytics,2024-03-01,2024-08-31,planned,innovation,false,sarah.johnson@company.com,Security Ops,,PRJ-004|PRJ-005,1712|1713,2024-03-15|2024-04-01,2024-08-15|2024-08-31,Trading analytics|Market data integration
Legacy System Modernization,Mainframe Modernization,infrastructure,Modernize mainframe applications,2024-04-01,2024-12-31,planned,infrastructure,false,michael.chen@company.com,Digital Banking,Cloud Platform|Security Ops,PRJ-005,1714,2024-04-15,2024-12-15,System modernization
Mobile App Enhancement,Mobile Authentication Enhancement,innovation,Add biometric authentication,2024-02-15,2024-06-30,in_progress,innovation,true,sarah.johnson@company.com,Security Ops,Digital Banking,,1710,2024-03-01,2024-06-15,Mobile auth enhancement`; 
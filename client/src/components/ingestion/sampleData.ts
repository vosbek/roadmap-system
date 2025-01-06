// Organization and hierarchy template
export const enterpriseSystemTemplate = `organization_name,area_name,team_name,architect_name,architect_email,application_name,application_description,subsystem_name,subsystem_description,subsystem_enterprise_id,subsystem_type,subsystem_status,capability_name,capability_description,capability_type,capability_status
Tech Division,Infrastructure,Cloud Platform,John Smith,john.smith@company.com,Customer Portal,Customer facing web portal,Authentication Service,Authentication and authorization system,1710,web,active,SSO Integration,Single sign-on capability,security,active
Tech Division,Infrastructure,Cloud Platform,John Smith,john.smith@company.com,Customer Portal,Customer facing web portal,Payment Processing,Payment gateway integration,1711,batch,active,Payment Gateway,Payment processing capability,financial,active
Tech Division,Security,Security Ops,Sarah Johnson,sarah.johnson@company.com,Trading Platform,Trading and order management,Order Management,Order processing system,1712,web,active,Order Validation,Order validation rules,business,active
Tech Division,Security,Security Ops,Sarah Johnson,sarah.johnson@company.com,Trading Platform,Trading and order management,Market Data Feed,Real-time market data,1713,batch,active,Data Streaming,Real-time data streaming,integration,active
Tech Division,Digital,Digital Banking,Michael Chen,michael.chen@company.com,Risk System,Risk assessment platform,Calculation Engine,Risk calculation system,1714,mainframe,active,Risk Analytics,Risk calculation algorithms,analytics,active`;

// Projects and relationships template
export const projectTemplate = `project_id,name,description,start_date,end_date,status,project_type,is_shared,owner_architect_email,owner_team_name,subscribed_team_names,dependency_project_ids,subsystem_enterprise_ids,custom_start_dates,custom_end_dates,notes
PRJ-001,Authentication Upgrade,Implement SSO and MFA,2024-01-01,2024-03-31,in_progress,infrastructure,false,john.smith@company.com,Cloud Platform,Security Ops|Digital Banking,PRJ-002,1710|1711,2024-01-15|2024-02-01,2024-03-15|2024-03-31,Auth system upgrade|Payment integration
PRJ-002,Payment Gateway Migration,Migrate to new payment provider,2024-02-01,2024-05-31,planned,infrastructure,true,john.smith@company.com,Cloud Platform,Digital Banking,PRJ-003,1711,2024-02-15,2024-05-15,Payment system migration
PRJ-003,Real-time Analytics,Implement real-time trading analytics,2024-03-01,2024-08-31,planned,innovation,false,sarah.johnson@company.com,Security Ops,,PRJ-004|PRJ-005,1712|1713,2024-03-15|2024-04-01,2024-08-15|2024-08-31,Trading analytics|Market data integration
PRJ-004,Legacy System Modernization,Modernize mainframe applications,2024-04-01,2024-12-31,planned,infrastructure,false,michael.chen@company.com,Digital Banking,Cloud Platform|Security Ops,PRJ-005,1714,2024-04-15,2024-12-15,System modernization
PRJ-005,Mobile App Enhancement,Add biometric authentication,2024-02-15,2024-06-30,in_progress,innovation,true,sarah.johnson@company.com,Security Ops,Digital Banking,,1710,2024-03-01,2024-06-15,Mobile auth enhancement`; 
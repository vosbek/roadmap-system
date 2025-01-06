import { driver } from '../config/neo4j';

async function initDb() {
  const session = driver.session();

  try {
    // Clear existing data
    await session.run('MATCH (n) DETACH DELETE n');

    // Create ecosystems
    await session.run(`
      CREATE (dbo:Ecosystem {name: 'Digital Back Office', id: 'dbo'})
      CREATE (ds:Ecosystem {name: 'Digital Sales', id: 'ds'})
      CREATE (dserv:Ecosystem {name: 'Digital Servicing', id: 'dserv'})
      CREATE (annuity:Ecosystem {name: 'Annuity Ecosystem', id: 'annuity'})
      CREATE (life:Ecosystem {name: 'Life Ecosystem', id: 'life'})
      CREATE (claims:Ecosystem {name: 'Claims Ecosystem', id: 'claims'})
      CREATE (admin:Ecosystem {name: 'Admin Systems', id: 'admin'})
    `);

    // Create applications with their types
    await session.run(`
      // Digital Back Office Applications
      CREATE (eb2b:Application {id: '1710', name: 'eB2B Feeds Processing', type: 'Application', ecosystem: 'Digital Back Office'})
      CREATE (nfdw:Application {id: '1780', name: 'NF Data Warehouse', type: 'Database', ecosystem: 'Digital Back Office'})
      CREATE (explainDb:Application {id: '1779', name: 'Explain - DB', type: 'Database', ecosystem: 'Digital Back Office'})
      CREATE (csfDesigner:Application {id: '6269', name: 'CSF Designer', type: 'Web Application', ecosystem: 'Digital Back Office'})
      CREATE (vldmLife:Application {id: '1781', name: 'VLDM - Life Reporting', type: 'Database', ecosystem: 'Digital Back Office'})
      CREATE (vldmOds:Application {id: '1782', name: 'VLDM - ODS', type: 'Database', ecosystem: 'Digital Back Office'})
      CREATE (salesMi:Application {id: '1802', name: 'SalesMi - Reporting', type: 'Database', ecosystem: 'Digital Back Office'})
      CREATE (actuarial:Application {id: '15125', name: 'Actuarial DataMart', type: 'Database', ecosystem: 'Digital Back Office'})

      // Digital Servicing Applications
      CREATE (pubImedia:Application {id: '5493', name: 'PUB-iMedia', type: 'Web Application', ecosystem: 'Digital Servicing'})
      CREATE (imediaTools:Application {id: '10178', name: 'iMedia Tools', type: 'Web Application', ecosystem: 'Digital Servicing'})
      CREATE (ssc:Application {id: '1718', name: 'SSC', type: 'Web Application', ecosystem: 'Digital Servicing'})
      CREATE (isc:Application {id: '1698', name: 'ISC', type: 'Web Application', ecosystem: 'Digital Servicing'})
      CREATE (ecif:Application {id: 'ecif', name: 'ECIF', type: 'API', ecosystem: 'Digital Servicing'})
      CREATE (inda:Application {id: '1241', name: 'INDA', type: 'Database', ecosystem: 'Digital Servicing'})

      // Annuity Ecosystem Applications
      CREATE (pallm:Application {id: 'pallm', name: 'PALLM', type: 'Admin System', ecosystem: 'Annuity Ecosystem'})
      CREATE (prom:Application {id: 'prom', name: 'PRoM', type: 'Admin System', ecosystem: 'Annuity Ecosystem'})
      CREATE (iaLoans:Application {id: 'ialoans', name: 'IA LOANS', type: 'Application', ecosystem: 'Annuity Ecosystem'})
      CREATE (wireManager:Application {id: 'wiremgr', name: 'Wire Manager', type: 'Application', ecosystem: 'Annuity Ecosystem'})
      CREATE (lcom:Application {id: '1777', name: 'LCOM', type: 'Application', ecosystem: 'Annuity Ecosystem'})
      CREATE (rps:Application {id: '6666', name: 'RPS 6', type: 'Application', ecosystem: 'Annuity Ecosystem'})
      CREATE (fac:Application {id: '3535', name: 'FAC', type: 'Application', ecosystem: 'Annuity Ecosystem'})
      CREATE (iaDesktop:Application {id: 'iadesktop', name: 'IA Desktop', type: 'Application', ecosystem: 'Annuity Ecosystem'})
      CREATE (atHub:Application {id: '24242', name: 'ATHub', type: 'Application', ecosystem: 'Annuity Ecosystem'})

      // External Entities
      CREATE (dtcc:Application {id: 'dtcc', name: 'DTCC', type: 'External Entity', ecosystem: 'External'})
      CREATE (jpmc:Application {id: 'jpmc', name: 'JPMC Wire Portal', type: 'External Entity', ecosystem: 'External'})
      CREATE (bloomberg:Application {id: 'bloomberg', name: 'Bloomberg', type: 'External Entity', ecosystem: 'External'})
    `);

    // Create data types
    await session.run(`
      CREATE (dt1:DataType {name: 'Contract Data'})
      CREATE (dt2:DataType {name: 'Customer Data'})
      CREATE (dt3:DataType {name: 'Payment Data'})
      CREATE (dt4:DataType {name: 'Wire Transfer Data'})
      CREATE (dt5:DataType {name: 'Market Data'})
      CREATE (dt6:DataType {name: 'Trade Data'})
      CREATE (dt7:DataType {name: 'Position Data'})
      CREATE (dt8:DataType {name: 'Sales Data'})
      CREATE (dt9:DataType {name: 'Commission Data'})
    `);

    // Create business domains
    await session.run(`
      CREATE (bd1:BusinessDomain {name: 'Annuity'})
      CREATE (bd2:BusinessDomain {name: 'Payments'})
      CREATE (bd3:BusinessDomain {name: 'Investment'})
      CREATE (bd4:BusinessDomain {name: 'Sales'})
      CREATE (bd5:BusinessDomain {name: 'Customer Service'})
      CREATE (bd6:BusinessDomain {name: 'Claims'})
      CREATE (bd7:BusinessDomain {name: 'Compliance'})
    `);

    // Create integrations between applications (separated into individual queries)
    await session.run(`
      MATCH (pallm:Application {name: 'PALLM'})
      MATCH (csf:Application {name: 'CSF Designer'})
      CREATE (pallm)-[:INTEGRATES_WITH {type: 'API', dataTypes: ['Contract Data', 'Customer Data'], businessDomains: ['Annuity']}]->(csf)
    `);

    await session.run(`
      MATCH (pallm:Application {name: 'PALLM'})
      MATCH (prom:Application {name: 'PRoM'})
      CREATE (pallm)-[:INTEGRATES_WITH {type: 'API', dataTypes: ['Contract Data'], businessDomains: ['Annuity']}]->(prom)
    `);

    await session.run(`
      MATCH (wire:Application {name: 'Wire Manager'})
      MATCH (pallm:Application {name: 'PALLM'})
      CREATE (wire)-[:INTEGRATES_WITH {type: 'API', dataTypes: ['Payment Data'], businessDomains: ['Payments']}]->(pallm)
    `);

    await session.run(`
      MATCH (jpmc:Application {name: 'JPMC Wire Portal'})
      MATCH (wire:Application {name: 'Wire Manager'})
      CREATE (jpmc)-[:INTEGRATES_WITH {type: 'File', dataTypes: ['Wire Transfer Data'], businessDomains: ['Payments']}]->(wire)
    `);

    await session.run(`
      MATCH (bloomberg:Application {name: 'Bloomberg'})
      MATCH (eb2b:Application {name: 'eB2B Feeds Processing'})
      CREATE (bloomberg)-[:INTEGRATES_WITH {type: 'File', dataTypes: ['Market Data'], businessDomains: ['Investment']}]->(eb2b)
    `);

    await session.run(`
      MATCH (eb2b:Application {name: 'eB2B Feeds Processing'})
      MATCH (dtcc:Application {name: 'DTCC'})
      CREATE (eb2b)-[:INTEGRATES_WITH {type: 'File', dataTypes: ['Trade Data', 'Position Data'], businessDomains: ['Investment']}]->(dtcc)
    `);

    await session.run(`
      MATCH (salesMi:Application {name: 'SalesMi - Reporting'})
      MATCH (vldmOds:Application {name: 'VLDM - ODS'})
      CREATE (salesMi)-[:INTEGRATES_WITH {type: 'Database', dataTypes: ['Sales Data', 'Commission Data'], businessDomains: ['Sales']}]->(vldmOds)
    `);

    await session.run(`
      MATCH (inda:Application {name: 'INDA'})
      MATCH (pallm:Application {name: 'PALLM'})
      CREATE (inda)-[:INTEGRATES_WITH {type: 'Database', dataTypes: ['Customer Data', 'Contract Data'], businessDomains: ['Annuity']}]->(pallm)
    `);

    // Add more integrations from the provided relationships
    await session.run(`
      CREATE (nfivr:Application {id: 'nfivr', name: 'NF IVR', type: 'Application', ecosystem: 'Digital Sales'})
      WITH nfivr
      MATCH (pallm:Application {name: 'PALLM'})
      CREATE (pallm)-[:INTEGRATES_WITH {type: 'API', dataTypes: ['Customer Data'], businessDomains: ['Customer Service']}]->(nfivr)
    `);

    await session.run(`
      CREATE (salesforce:Application {id: '6834', name: 'NF Salesforce Gridbuddy', type: 'Application', ecosystem: 'Digital Sales'})
      WITH salesforce
      MATCH (pallm:Application {name: 'PALLM'})
      CREATE (pallm)-[:INTEGRATES_WITH {type: 'API', dataTypes: ['Sales Data', 'Customer Data'], businessDomains: ['Sales']}]->(salesforce)
    `);

    await session.run(`
      MATCH (pallm:Application {name: 'PALLM'})
      MATCH (iaLoans:Application {name: 'IA LOANS'})
      CREATE (pallm)-[:INTEGRATES_WITH {type: 'API', dataTypes: ['Contract Data', 'Payment Data'], businessDomains: ['Annuity']}]->(iaLoans)
    `);

    await session.run(`
      MATCH (pallm:Application {name: 'PALLM'})
      MATCH (actuarial:Application {name: 'Actuarial DataMart'})
      CREATE (pallm)-[:INTEGRATES_WITH {type: 'File', dataTypes: ['Contract Data'], businessDomains: ['Annuity']}]->(actuarial)
    `);

    await session.run(`
      CREATE (aims:Application {id: 'aims1719', name: 'AIMS - Agent Information Management System', type: 'Application', ecosystem: 'Digital Sales'})
      WITH aims
      MATCH (pallm:Application {name: 'PALLM'})
      CREATE (aims)-[:INTEGRATES_WITH {type: 'File', dataTypes: ['Agent Data'], businessDomains: ['Sales']}]->(pallm)
    `);

    await session.run(`
      MATCH (aims:Application {name: 'AIMS - Agent Information Management System'})
      MATCH (isc:Application {name: 'ISC'})
      CREATE (aims)-[:INTEGRATES_WITH {type: 'File', dataTypes: ['Agent Data'], businessDomains: ['Sales']}]->(isc)
    `);

    await session.run(`
      CREATE (nfcs:Application {id: '7865', name: 'NF Commissions System (NFCS)', type: 'Application', ecosystem: 'Digital Sales'})
      WITH nfcs
      MATCH (explainDb:Application {name: 'Explain - DB'})
      CREATE (nfcs)-[:INTEGRATES_WITH {type: 'Database', dataTypes: ['Commission Data'], businessDomains: ['Sales']}]->(explainDb)
    `);

    await session.run(`
      MATCH (explainDb:Application {name: 'Explain - DB'})
      MATCH (eb2b:Application {name: 'eB2B Feeds Processing'})
      CREATE (explainDb)-[:INTEGRATES_WITH {type: 'Database', dataTypes: ['Commission Data'], businessDomains: ['Sales']}]->(eb2b)
    `);

    await session.run(`
      MATCH (vldmLife:Application {name: 'VLDM - Life Reporting'})
      MATCH (eb2b:Application {name: 'eB2B Feeds Processing'})
      CREATE (vldmLife)-[:INTEGRATES_WITH {type: 'Database', dataTypes: ['Commission Data'], businessDomains: ['Sales']}]->(eb2b)
    `);

    await session.run(`
      CREATE (nfnComm:Application {id: 'nfncomm', name: 'NFN Commissions Compensations Database', type: 'Database', ecosystem: 'Life Ecosystem'})
      WITH nfnComm
      MATCH (eb2b:Application {name: 'eB2B Feeds Processing'})
      CREATE (nfnComm)-[:INTEGRATES_WITH {type: 'Database', dataTypes: ['Commission Data'], businessDomains: ['Sales']}]->(eb2b)
    `);

    await session.run(`
      MATCH (salesMi:Application {name: 'SalesMi - Reporting'})
      MATCH (eb2b:Application {name: 'eB2B Feeds Processing'})
      CREATE (salesMi)-[:INTEGRATES_WITH {type: 'Database', dataTypes: ['Sales Data'], businessDomains: ['Sales']}]->(eb2b)
    `);

    await session.run(`
      MATCH (salesMi:Application {name: 'SalesMi - Reporting'})
      MATCH (vldmOds:Application {name: 'VLDM - ODS'})
      CREATE (salesMi)-[:INTEGRATES_WITH {type: 'Database', dataTypes: ['Sales Data'], businessDomains: ['Sales']}]->(vldmOds)
    `);

    await session.run(`
      CREATE (aimsBatch:Application {id: '7415', name: 'AIMS - Batch Component', type: 'Database', ecosystem: 'Digital Sales'})
      WITH aimsBatch
      MATCH (pallm:Application {name: 'PALLM'})
      CREATE (aimsBatch)-[:INTEGRATES_WITH {type: 'File', dataTypes: ['Agent Data'], businessDomains: ['Sales']}]->(pallm)
    `);

    await session.run(`
      MATCH (aimsBatch:Application {name: 'AIMS - Batch Component'})
      MATCH (salesMi:Application {name: 'SalesMi - Reporting'})
      CREATE (aimsBatch)-[:INTEGRATES_WITH {type: 'Database', dataTypes: ['Agent Data'], businessDomains: ['Sales']}]->(salesMi)
    `);

    await session.run(`
      MATCH (aimsBatch:Application {name: 'AIMS - Batch Component'})
      MATCH (eb2b:Application {name: 'eB2B Feeds Processing'})
      CREATE (aimsBatch)-[:INTEGRATES_WITH {type: 'File', dataTypes: ['Agent Data'], businessDomains: ['Sales']}]->(eb2b)
    `);

    // Add Admin Systems
    await session.run(`
      CREATE (vantage:Application {id: 'vantage', name: 'Vantage', type: 'Admin System', ecosystem: 'Admin Systems'})
      CREATE (cyberLife:Application {id: 'cyberlife', name: 'CyberLife', type: 'Admin System', ecosystem: 'Admin Systems'})
      CREATE (oipa:Application {id: 'oipa', name: 'OIPA', type: 'Admin System', ecosystem: 'Admin Systems'})
      CREATE (alsPrefix:Application {id: 'alsprefix', name: 'ALS Prefix', type: 'Admin System', ecosystem: 'Admin Systems'})
      CREATE (calypso:Application {id: 'calypso', name: 'Calypso', type: 'Admin System', ecosystem: 'Admin Systems'})
      CREATE (aims:Application {id: 'aims', name: 'AIMS', type: 'Admin System', ecosystem: 'Admin Systems'})
    `);

    // Add integrations from Admin Systems to eB2B
    await session.run(`
      MATCH (vantage:Application {name: 'Vantage'})
      MATCH (eb2b:Application {name: 'eB2B Feeds Processing'})
      CREATE (vantage)-[:INTEGRATES_WITH {type: 'File', dataTypes: ['Contract Data'], businessDomains: ['Life Insurance']}]->(eb2b)
    `);

    await session.run(`
      MATCH (cyberLife:Application {name: 'CyberLife'})
      MATCH (eb2b:Application {name: 'eB2B Feeds Processing'})
      CREATE (cyberLife)-[:INTEGRATES_WITH {type: 'File', dataTypes: ['Contract Data'], businessDomains: ['Life Insurance']}]->(eb2b)
    `);

    await session.run(`
      MATCH (oipa:Application {name: 'OIPA'})
      MATCH (eb2b:Application {name: 'eB2B Feeds Processing'})
      CREATE (oipa)-[:INTEGRATES_WITH {type: 'File', dataTypes: ['Contract Data'], businessDomains: ['Life Insurance']}]->(eb2b)
    `);

    await session.run(`
      MATCH (alsPrefix:Application {name: 'ALS Prefix'})
      MATCH (eb2b:Application {name: 'eB2B Feeds Processing'})
      CREATE (alsPrefix)-[:INTEGRATES_WITH {type: 'File', dataTypes: ['Contract Data'], businessDomains: ['Life Insurance']}]->(eb2b)
    `);

    await session.run(`
      MATCH (calypso:Application {name: 'Calypso'})
      MATCH (eb2b:Application {name: 'eB2B Feeds Processing'})
      CREATE (calypso)-[:INTEGRATES_WITH {type: 'File', dataTypes: ['Contract Data'], businessDomains: ['Life Insurance']}]->(eb2b)
    `);

    await session.run(`
      MATCH (aims:Application {name: 'AIMS'})
      MATCH (eb2b:Application {name: 'eB2B Feeds Processing'})
      CREATE (aims)-[:INTEGRATES_WITH {type: 'File', dataTypes: ['Agent Data'], businessDomains: ['Sales']}]->(eb2b)
    `);

    // Add Claims Desktop
    await session.run(`
      CREATE (claims:Application {id: 'claims', name: 'Nationwide Financial Claims Desktop', type: 'Application', ecosystem: 'Claims Ecosystem'})
      WITH claims
      MATCH (pallm:Application {name: 'PALLM'})
      CREATE (pallm)-[:INTEGRATES_WITH {type: 'API', dataTypes: ['Claims Data'], businessDomains: ['Claims']}]->(claims)
    `);

    // Add EFTS and its integrations
    await session.run(`
      CREATE (efts:Application {id: 'efts', name: 'EFTS', type: 'Application', ecosystem: 'Digital Back Office'})
      WITH efts
      MATCH (eb2b:Application {name: 'eB2B Feeds Processing'})
      MATCH (nfcs:Application {name: 'NF Commissions System (NFCS)'})
      CREATE (eb2b)-[:INTEGRATES_WITH {type: 'File', dataTypes: ['Commission Data'], businessDomains: ['Sales']}]->(efts),
             (efts)-[:INTEGRATES_WITH {type: 'File', dataTypes: ['Commission Data'], businessDomains: ['Sales']}]->(nfcs),
             (nfcs)-[:INTEGRATES_WITH {type: 'File', dataTypes: ['Commission Data'], businessDomains: ['Sales']}]->(efts),
             (efts)-[:INTEGRATES_WITH {type: 'File', dataTypes: ['Commission Data'], businessDomains: ['Sales']}]->(eb2b)
    `);

    // Add more data types
    await session.run(`
      CREATE (dt10:DataType {name: 'Agent Data'})
      CREATE (dt11:DataType {name: 'Claims Data'})
      CREATE (dt12:DataType {name: 'Life Insurance Data'})
    `);

    // Add more business domains
    await session.run(`
      CREATE (bd8:BusinessDomain {name: 'Life Insurance'})
      CREATE (bd9:BusinessDomain {name: 'Policy Admin'})
    `);

    console.log('Database initialized successfully with sample data');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await session.close();
  }
}

initDb(); 
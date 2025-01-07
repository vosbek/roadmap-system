import {
    Organization,
    Area,
    Team,
    Architect,
    Application,
    ingestOrganizations,
    ingestAreas,
    ingestTeams,
    ingestArchitects,
    ingestApplications
} from './dataIngestion';

const sampleData = {
    organizations: [
        {
            name: "Test Organization",
            description: "A test organization",
            contact_info: "contact@test.org"
        }
    ] as Organization[],

    areas: [
        {
            organization_id: 1, // This will be replaced with actual ID after organization insertion
            name: "Engineering",
            description: "Engineering department"
        }
    ] as Area[],

    teams: [
        {
            area_id: 1, // This will be replaced with actual ID after area insertion
            name: "Backend Team"
        }
    ] as Team[],

    architects: [
        {
            name: "John Doe",
            email: "john@test.org",
            contact_info: "555-0123"
        }
    ] as Architect[],

    applications: [
        {
            team_id: 1, // This will be replaced with actual ID after team insertion
            architect_id: 1, // This will be replaced with actual ID after architect insertion
            name: "Core API",
            description: "Main backend API",
            status: "active",
            enterprise_id: "API-001"
        }
    ] as Application[]
};

async function runSampleIngestion() {
    try {
        // Insert organizations and get IDs
        console.log('Inserting organizations...');
        const orgIds = await ingestOrganizations(sampleData.organizations);
        
        // Update areas with actual organization IDs and insert
        console.log('Inserting areas...');
        sampleData.areas[0].organization_id = orgIds[0];
        const areaIds = await ingestAreas(sampleData.areas);
        
        // Update teams with actual area IDs and insert
        console.log('Inserting teams...');
        sampleData.teams[0].area_id = areaIds[0];
        const teamIds = await ingestTeams(sampleData.teams);
        
        // Insert architects
        console.log('Inserting architects...');
        const architectIds = await ingestArchitects(sampleData.architects);
        
        // Update applications with actual team and architect IDs and insert
        console.log('Inserting applications...');
        sampleData.applications[0].team_id = teamIds[0];
        sampleData.applications[0].architect_id = architectIds[0];
        const appIds = await ingestApplications(sampleData.applications);
        
        console.log('Sample data ingestion completed successfully');
        console.log('Inserted IDs:', {
            organizations: orgIds,
            areas: areaIds,
            teams: teamIds,
            architects: architectIds,
            applications: appIds
        });
    } catch (error) {
        console.error('Sample data ingestion failed:', error);
        throw error;
    }
}

if (require.main === module) {
    runSampleIngestion().catch(console.error);
} 
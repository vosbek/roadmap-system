import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  Grid, 
  Button, 
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Paper,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Chip,
  Autocomplete,
  TextField
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import GraphVisualization from './GraphVisualization';
import IntegrationForm from './IntegrationForm';
import DataLineageView from './DataLineageView';
import DataCatalogView from '../catalog/DataCatalogView';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`integration-tabpanel-${index}`}
      aria-labelledby={`integration-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Legend: React.FC = () => (
  <Paper 
    elevation={3}
    sx={{ 
      p: 2, 
      position: 'absolute', 
      top: 16, 
      right: 16, 
      zIndex: 1000, 
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: 2,
      maxWidth: 300
    }}
  >
    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
      Legend
    </Typography>

    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary' }}>
        Application Types
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#4CAF50' }} />
          <Typography variant="body2">Web Application</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#9C27B0' }} />
          <Typography variant="body2">Admin System</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#2196F3' }} />
          <Typography variant="body2">Database</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FF9800' }} />
          <Typography variant="body2">API</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#607D8B' }} />
          <Typography variant="body2">External Entity</Typography>
        </Box>
      </Box>
    </Box>

    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary' }}>
        Integration Types
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 20, height: 2, bgcolor: '#FF9800' }} />
            <Box 
              component="span"
              sx={{ 
                width: 0,
                height: 0,
                borderLeft: '4px solid #FF9800',
                borderTop: '4px solid transparent',
                borderBottom: '4px solid transparent',
                ml: '-2px'
              }} 
            />
          </Box>
          <Typography variant="body2">API Integration</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 20, height: 2, bgcolor: '#2196F3' }} />
            <Box 
              component="span"
              sx={{ 
                width: 0,
                height: 0,
                borderLeft: '4px solid #2196F3',
                borderTop: '4px solid transparent',
                borderBottom: '4px solid transparent',
                ml: '-2px'
              }} 
            />
          </Box>
          <Typography variant="body2">Database Connection</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 20, height: 2, bgcolor: '#4CAF50' }} />
            <Box 
              component="span"
              sx={{ 
                width: 0,
                height: 0,
                borderLeft: '4px solid #4CAF50',
                borderTop: '4px solid transparent',
                borderBottom: '4px solid transparent',
                ml: '-2px'
              }} 
            />
          </Box>
          <Typography variant="body2">File Transfer</Typography>
        </Box>
      </Box>
    </Box>

    <Box>
      <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary' }}>
        Interactions
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        • Click on nodes or links to view details
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        • Drag nodes to adjust layout
      </Typography>
      <Typography variant="body2" color="text.secondary">
        • Scroll to zoom in/out
      </Typography>
    </Box>
  </Paper>
);

interface DetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  selectedItem: any;
  itemType: 'node' | 'link' | null;
}

const DetailsDrawer: React.FC<DetailsDrawerProps> = ({
  open,
  onClose,
  selectedItem,
  itemType
}) => {
  const [editedDataTypes, setEditedDataTypes] = useState<string[]>([]);
  const [editedBusinessDomains, setEditedBusinessDomains] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [dataTypes, setDataTypes] = useState<string[]>([]);
  const [businessDomains, setBusinessDomains] = useState<string[]>([]);

  useEffect(() => {
    if (selectedItem) {
      setEditedDataTypes(selectedItem.dataTypes || []);
      setEditedBusinessDomains(selectedItem.businessDomains || []);
    }
  }, [selectedItem]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [dtResponse, bdResponse] = await Promise.all([
          fetch('http://localhost:3001/api/integrations/datatypes'),
          fetch('http://localhost:3001/api/integrations/businessdomains')
        ]);
        
        const dtData = await dtResponse.json();
        const bdData = await bdResponse.json();
        
        setDataTypes(dtData.map((dt: any) => dt.name));
        setBusinessDomains(bdData.map((bd: any) => bd.name));
      } catch (err) {
        console.error('Error fetching options:', err);
      }
    };
    
    fetchOptions();
  }, []);

  const handleSave = async () => {
    try {
      const endpoint = itemType === 'node' 
        ? `/api/applications/${selectedItem.id}`
        : `/api/integrations/${selectedItem.id}`;

      const response = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dataTypes: editedDataTypes,
          businessDomains: editedBusinessDomains,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update tags');
      }

      // Update the local state with new values
      selectedItem.dataTypes = editedDataTypes;
      selectedItem.businessDomains = editedBusinessDomains;
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating tags:', err);
    }
  };

  if (!selectedItem) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: 360 }
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            {itemType === 'node' ? 'Application Details' : 'Integration Details'}
          </Typography>
          {!isEditing ? (
            <Button 
              size="small" 
              startIcon={<EditIcon />} 
              onClick={() => setIsEditing(true)}
            >
              Edit Tags
            </Button>
          ) : (
            <Box>
              <Button 
                size="small" 
                sx={{ mr: 1 }} 
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button 
                size="small" 
                variant="contained" 
                onClick={handleSave}
              >
                Save
              </Button>
            </Box>
          )}
        </Box>
        
        <List>
          {itemType === 'node' && (
            <>
              <ListItem>
                <ListItemText 
                  primary="Name"
                  secondary={selectedItem.name}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Type"
                  secondary={selectedItem.type}
                />
              </ListItem>
            </>
          )}

          {itemType === 'link' && (
            <ListItem>
              <ListItemText 
                primary="Integration Type"
                secondary={selectedItem.type}
              />
            </ListItem>
          )}

          <ListItem>
            <ListItemText 
              primary="Data Types"
              secondaryTypographyProps={{ component: 'div' }}
              secondary={
                isEditing ? (
                  <Autocomplete
                    multiple
                    options={dataTypes}
                    value={editedDataTypes}
                    onChange={(_, newValue) => setEditedDataTypes(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        size="small"
                        placeholder="Select data types"
                        sx={{ mt: 1 }}
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => {
                        const { key, ...chipProps } = getTagProps({ index });
                        return (
                          <Chip
                            key={key}
                            {...chipProps}
                            label={option}
                            size="small"
                          />
                        );
                      })
                    }
                  />
                ) : (
                  <Box sx={{ mt: 1 }}>
                    {selectedItem.dataTypes?.length > 0 ? (
                      selectedItem.dataTypes.map((type: string) => (
                        <Chip 
                          key={type}
                          label={type}
                          size="small"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No data types assigned
                      </Typography>
                    )}
                  </Box>
                )
              }
            />
          </ListItem>

          <ListItem>
            <ListItemText 
              primary="Business Domains"
              secondaryTypographyProps={{ component: 'div' }}
              secondary={
                isEditing ? (
                  <Autocomplete
                    multiple
                    options={businessDomains}
                    value={editedBusinessDomains}
                    onChange={(_, newValue) => setEditedBusinessDomains(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        size="small"
                        placeholder="Select business domains"
                        sx={{ mt: 1 }}
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => {
                        const { key, ...chipProps } = getTagProps({ index });
                        return (
                          <Chip
                            key={key}
                            {...chipProps}
                            label={option}
                            size="small"
                          />
                        );
                      })
                    }
                  />
                ) : (
                  <Box sx={{ mt: 1 }}>
                    {selectedItem.businessDomains?.length > 0 ? (
                      selectedItem.businessDomains.map((domain: string) => (
                        <Chip 
                          key={domain}
                          label={domain}
                          size="small"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No business domains assigned
                      </Typography>
                    )}
                  </Box>
                )
              }
            />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

const IntegrationsView: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<any>({
    nodes: [],
    links: []
  });
  const [applications, setApplications] = useState<Array<{ id: string; name: string; type: string }>>([]);
  const [dataTypes, setDataTypes] = useState<Array<{ name: string }>>([]);
  const [businessDomains, setBusinessDomains] = useState<Array<{ name: string }>>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedItemType, setSelectedItemType] = useState<'node' | 'link' | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const fetchGraphData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch applications
      const appsResponse = await fetch('http://localhost:3001/api/applications');
      const appsData = await appsResponse.json();
      setApplications(appsData);

      // Fetch data types
      const dataTypesResponse = await fetch('http://localhost:3001/api/integrations/datatypes');
      const dataTypesData = await dataTypesResponse.json();
      setDataTypes(dataTypesData);

      // Fetch business domains
      const domainsResponse = await fetch('http://localhost:3001/api/integrations/businessdomains');
      const domainsData = await domainsResponse.json();
      setBusinessDomains(domainsData);

      // Fetch graph data
      const graphResponse = await fetch('http://localhost:3001/api/integrations/graph');
      const graphResponseData = await graphResponse.json();
      console.log('Raw graph data from server:', graphResponseData);
      
      // Transform data into the format expected by react-force-graph-2d
      const nodes: any[] = [];
      const links: any[] = [];
      const nodeMap = new Map();

      graphResponseData.forEach((item: any) => {
        if (item.source && !nodeMap.has(item.source.id)) {
          nodeMap.set(item.source.id, true);
          nodes.push({
            id: item.source.id,
            name: item.source.name,
            type: item.source.type || 'Unknown'
          });
        }
        if (item.target && !nodeMap.has(item.target.id)) {
          nodeMap.set(item.target.id, true);
          nodes.push({
            id: item.target.id,
            name: item.target.name,
            type: item.target.type || 'Unknown'
          });
        }
        if (item.source && item.target && item.integration) {
          links.push({
            source: item.source.id,
            target: item.target.id,
            type: item.integration.type || 'Unknown',
            dataTypes: item.integration.dataTypes || [],
            businessDomains: item.integration.businessDomains || []
          });
        }
      });

      console.log('Transformed graph data:', { nodes, links });
      setGraphData({ nodes, links });

    } catch (err) {
      setError('Failed to load integration data. Please try again.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, []);

  const handleAddIntegration = async (integrationData: any) => {
    try {
      const response = await fetch('http://localhost:3001/api/integrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(integrationData),
      });

      if (!response.ok) {
        throw new Error('Failed to add integration');
      }

      // Refresh the graph data
      await fetchGraphData();
    } catch (err) {
      setError('Failed to add integration. Please try again.');
      console.error('Error adding integration:', err);
    }
  };

  const handleRefresh = () => {
    fetchGraphData();
  };

  const handleNodeClick = (node: any) => {
    setSelectedItem(node);
    setSelectedItemType('node');
  };

  const handleLinkClick = (link: any) => {
    setSelectedItem(link);
    setSelectedItemType('link');
  };

  const handleDetailsClose = () => {
    setSelectedItem(null);
    setSelectedItemType(null);
  };

  return (
    <Box sx={{ 
      p: 3, 
      '& input::placeholder': {
        color: 'text.secondary',
        opacity: 0.7
      },
      '& input': {
        fontSize: '1rem',
        textSizeAdjust: 'none'
      }
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ 
            fontSize: { xs: '1.5rem', sm: '2rem' },
            fontWeight: 600,
            color: 'text.primary'
          }}>
            Data Integration Knowledge Graph
          </Typography>
          <Typography variant="subtitle1" sx={{ 
            mt: 1,
            color: 'text.secondary',
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}>
            Track and visualize data flows across applications
          </Typography>
        </Box>
        <Box>
          <IconButton 
            sx={{ 
              mr: 1,
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }} 
            title="Refresh integrations" 
            onClick={handleRefresh}
          >
            <RefreshIcon />
          </IconButton>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setIsFormOpen(true)}
            sx={{
              fontWeight: 500,
              textTransform: 'none',
              '&:hover': {
                boxShadow: 2
              }
            }}
          >
            New Integration
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            '& .MuiAlert-message': {
              fontSize: '0.875rem'
            }
          }}
        >
          {error}
        </Alert>
      )}

      <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'divider',
        '& .MuiTab-root': {
          textTransform: 'none',
          fontSize: '0.875rem',
          fontWeight: 500,
          minHeight: 48
        }
      }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{
            '& .Mui-selected': {
              color: 'primary.main',
              fontWeight: 600
            }
          }}
        >
          <Tab label="Integration Map" />
          <Tab label="Data Lineage" />
          <Tab label="Data Catalog" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress size={40} />
          </Box>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card sx={{ 
                p: 2, 
                height: '70vh', 
                position: 'relative',
                boxShadow: 2,
                borderRadius: 2
              }}>
                <Legend />
                <GraphVisualization 
                  data={graphData}
                  onNodeClick={handleNodeClick}
                  onLinkClick={handleLinkClick}
                />
              </Card>
            </Grid>
          </Grid>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Card sx={{ 
          p: 2, 
          height: '70vh',
          boxShadow: 2,
          borderRadius: 2
        }}>
          <DataLineageView />
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Card sx={{ 
          p: 2,
          boxShadow: 2,
          borderRadius: 2
        }}>
          <DataCatalogView />
        </Card>
      </TabPanel>

      {isFormOpen && (
        <IntegrationForm
          onClose={() => setIsFormOpen(false)}
          onSuccess={handleRefresh}
        />
      )}

      <DetailsDrawer
        open={!!selectedItem}
        onClose={handleDetailsClose}
        selectedItem={selectedItem}
        itemType={selectedItemType}
      />
    </Box>
  );
};

export default IntegrationsView; 
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  Stack,
  Badge,
  Autocomplete,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Skeleton,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import StorageIcon from '@mui/icons-material/Storage';
import ApiIcon from '@mui/icons-material/Api';
import WebIcon from '@mui/icons-material/Web';
import InfoIcon from '@mui/icons-material/Info';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SortIcon from '@mui/icons-material/Sort';
import TimelineIcon from '@mui/icons-material/Timeline';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { alpha } from '@mui/material/styles';

interface DataAsset {
  id: string;
  name: string;
  description: string;
  type: string;
  businessDomains: string[];
  systems: Array<{
    name: string;
    type: string;
    role: 'producer' | 'consumer';
  }>;
  updateFrequency: string;
  owner: string;
  tags: string[];
}

const MOCK_DATA: DataAsset[] = [
  {
    id: '1',
    name: 'Commission Calculations',
    description: 'Core commission calculation data including rates, tiers, and payment structures',
    type: 'Structured',
    businessDomains: ['Commission Data', 'Financial Data'],
    systems: [
      { name: 'EB2B', type: 'Web Application', role: 'producer' },
      { name: 'Commission DB', type: 'Database', role: 'consumer' },
      { name: 'EFTS', type: 'API', role: 'consumer' }
    ],
    updateFrequency: 'Daily',
    owner: 'Commission Team',
    tags: ['Financial', 'Core', 'High Priority']
  },
  {
    id: '2',
    name: 'Annuity Contracts',
    description: 'Annuity contract data including terms, conditions, and policyholder information',
    type: 'Structured',
    businessDomains: ['Annuity Data', 'Customer Data'],
    systems: [
      { name: 'Policy System', type: 'Web Application', role: 'producer' },
      { name: 'Contract DB', type: 'Database', role: 'consumer' }
    ],
    updateFrequency: 'Real-time',
    owner: 'Annuity Operations',
    tags: ['Contracts', 'Customer', 'Critical']
  },
  {
    id: '3',
    name: 'Customer Documents',
    description: 'Customer-related documentation including statements, notices, and correspondence',
    type: 'Unstructured',
    businessDomains: ['Customer Data'],
    systems: [
      { name: 'Document Management', type: 'Web Application', role: 'producer' },
      { name: 'Customer Portal', type: 'Web Application', role: 'consumer' }
    ],
    updateFrequency: 'Daily',
    owner: 'Document Services',
    tags: ['Documents', 'Customer Service']
  }
];

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
      id={`catalog-tabpanel-${index}`}
      aria-labelledby={`catalog-tab-${index}`}
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

const APPLICATION_TEMPLATE = `id,name,type,ecosystem,description,business_domains,data_types
app123,Customer Portal,Web Application,Digital Sales,Customer-facing web portal,"Sales,Customer Service","Customer Data,Contract Data"
app124,Payment Gateway,API,Financial Services,Payment processing system,"Payments,Financial","Payment Data,Transaction Data"`;

const INTEGRATION_TEMPLATE = `source_id,target_id,direction,type,name,description,data_types,business_domains,frequency,schedule
app123,app124,OUTBOUND,API,Customer Payment Integration,Integration between Customer Portal and Payment Gateway,"Payment Data,Customer Data","Financial,Sales",Real-time,24/7
app124,app125,BIDIRECTIONAL,Database,Payment Data Sync,Syncs payment data to data warehouse,"Payment Data,Transaction Data","Financial,Analytics",Daily,00:00 UTC
app126,app127,INBOUND,File,Document Import,Imports customer documents,"Document Data","Customer Service",Hourly,*/1 * * * *`;

const DataCatalogView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [dataAssets, setDataAssets] = useState<DataAsset[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'updateFrequency'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [activeTab, setActiveTab] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    name: string;
    status: 'uploading' | 'processing' | 'success' | 'error';
    progress: number;
    error?: string;
  }>>([]);

  // Statistics
  const getStatistics = () => {
    const totalAssets = dataAssets.length;
    const uniqueDomains = new Set(dataAssets.flatMap(asset => asset.businessDomains)).size;
    const uniqueSystems = new Set(dataAssets.flatMap(asset => asset.systems.map(s => s.name))).size;
    return { totalAssets, uniqueDomains, uniqueSystems };
  };

  // Fetch data assets
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setDataAssets(MOCK_DATA);
      } catch (error) {
        console.error('Error fetching data assets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getSystemIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'web application':
        return <WebIcon />;
      case 'database':
        return <StorageIcon />;
      case 'api':
        return <ApiIcon />;
      default:
        return <StorageIcon />;
    }
  };

  const sortAssets = (assets: DataAsset[]) => {
    return [...assets].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'updateFrequency') {
        comparison = a.updateFrequency.localeCompare(b.updateFrequency);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  const filteredAssets = sortAssets(dataAssets.filter(asset => {
    const matchesSearch = searchTerm === '' || 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDomains = selectedDomains.length === 0 ||
      asset.businessDomains.some(domain => selectedDomains.includes(domain));
    
    const matchesTypes = selectedTypes.length === 0 ||
      selectedTypes.includes(asset.type);

    return matchesSearch && matchesDomains && matchesTypes;
  }));

  const stats = getStatistics();

  const renderSkeleton = () => (
    <Grid container spacing={3}>
      {[1, 2, 3].map((item) => (
        <Grid item xs={12} md={6} lg={4} key={item}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="60%" height={32} />
              <Skeleton variant="text" width="100%" height={20} sx={{ mt: 1 }} />
              <Skeleton variant="text" width="100%" height={20} />
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Skeleton variant="rectangular" height={60} />
                <Skeleton variant="rectangular" height={60} />
                <Skeleton variant="rectangular" height={60} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const handleFileUpload = async (files: FileList) => {
    for (const file of Array.from(files)) {
      const fileEntry = {
        name: file.name,
        status: 'uploading' as const,
        progress: 0
      };
      setUploadedFiles(prev => [...prev, fileEntry]);

      try {
        const formData = new FormData();
        formData.append('file', file);

        // Determine endpoint based on file name
        const isApplication = file.name.toLowerCase().includes('application');
        const endpoint = isApplication ? 'applications' : 'integrations';

        // Simulate file upload progress
        const progressInterval = setInterval(() => {
          setUploadedFiles(prev => prev.map(f => 
            f.name === file.name && f.status === 'uploading'
              ? { ...f, progress: Math.min(f.progress + 10, 90) }
              : f
          ));
        }, 200);

        const response = await fetch(`http://localhost:3001/api/integrations/bulk/${endpoint}`, {
          method: 'POST',
          body: formData
        });

        clearInterval(progressInterval);

        if (!response.ok) {
          throw new Error('Failed to process file');
        }

        setUploadedFiles(prev => prev.map(f =>
          f.name === file.name
            ? { ...f, status: 'success', progress: 100 }
            : f
        ));
      } catch (error) {
        setUploadedFiles(prev => prev.map(f =>
          f.name === file.name
            ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Failed to process file' }
            : f
        ));
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const downloadTemplate = (type: string) => {
    const template = type === 'applications' ? APPLICATION_TEMPLATE : INTEGRATION_TEMPLATE;
    const fileName = type === 'applications' ? 'applications_template.csv' : 'integrations_template.csv';
    
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Tabs 
        value={activeTab} 
        onChange={(_, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Browse" />
        <Tab label="Bulk Import" />
      </Tabs>

      <TabPanel value={activeTab} index={0}>
        {/* Statistics Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <Typography variant="h4">{stats.totalAssets}</Typography>
              <Typography variant="subtitle1">Data Assets</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
              <Typography variant="h4">{stats.uniqueDomains}</Typography>
              <Typography variant="subtitle1">Business Domains</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'info.contrastText' }}>
              <Typography variant="h4">{stats.uniqueSystems}</Typography>
              <Typography variant="subtitle1">Connected Systems</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Search and Filter Section */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search data assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Autocomplete
                multiple
                options={['Commission Data', 'Annuity Data', 'Customer Data', 'Product Data']}
                value={selectedDomains}
                onChange={(_, newValue) => setSelectedDomains(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Business Domain"
                    placeholder="Filter by domain"
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
            </Grid>
            <Grid item xs={12} md={3}>
              <Autocomplete
                multiple
                options={['Structured', 'Unstructured', 'Semi-structured']}
                value={selectedTypes}
                onChange={(_, newValue) => setSelectedTypes(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Data Type"
                    placeholder="Filter by type"
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
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'updateFrequency')}
                  endAdornment={
                    <IconButton 
                      size="small" 
                      onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
                      sx={{ mr: 1 }}
                    >
                      <SortIcon sx={{ transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'none' }} />
                    </IconButton>
                  }
                >
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="updateFrequency">Update Frequency</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Results Summary */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" color="text.secondary">
            Showing {filteredAssets.length} of {dataAssets.length} data assets
          </Typography>
        </Box>

        {/* Data Assets Grid */}
        {loading ? (
          renderSkeleton()
        ) : filteredAssets.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            No data assets found matching your criteria. Try adjusting your filters.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {filteredAssets.map((asset) => (
              <Grid item xs={12} md={6} lg={4} key={asset.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                      <Typography variant="h6" component="div">
                        {asset.name}
                      </Typography>
                      <Tooltip title="View data lineage">
                        <IconButton 
                          size="small"
                          sx={{ 
                            color: 'primary.main',
                            '&:hover': {
                              backgroundColor: alpha('#1976d2', 0.04)
                            }
                          }}
                        >
                          <TimelineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    
                    <Typography 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: '48px'
                      }}
                    >
                      {asset.description}
                    </Typography>

                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Business Domains
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {asset.businessDomains.map((domain, i) => (
                            <Chip
                              key={i}
                              label={domain}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Systems
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {asset.systems.map((system, i) => (
                            <Chip
                              key={i}
                              icon={getSystemIcon(system.type)}
                              label={`${system.name} (${system.role})`}
                              size="small"
                              variant="outlined"
                              sx={{
                                borderColor: system.role === 'producer' ? 'success.main' : 'info.main',
                                color: system.role === 'producer' ? 'success.main' : 'info.main'
                              }}
                            />
                          ))}
                        </Box>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Tags
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {asset.tags.map((tag, i) => (
                            <Chip
                              key={i}
                              label={tag}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                    </Stack>
                  </CardContent>

                  <Divider />
                  
                  <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Updated: {asset.updateFrequency}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Owner: {asset.owner}
                    </Typography>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          {/* Templates Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Download Templates
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Use these templates to prepare your data for bulk import
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  onClick={() => downloadTemplate('applications')}
                >
                  Applications Template
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  onClick={() => downloadTemplate('integrations')}
                >
                  Integrations Template
                </Button>
              </Stack>
            </Paper>
          </Grid>

          {/* Upload Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Upload Data
              </Typography>
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 3,
                  textAlign: 'center',
                  bgcolor: 'background.default',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: alpha('#1976d2', 0.04)
                  }
                }}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept=".csv"
                  style={{ display: 'none' }}
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                />
                <UploadFileIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Drag and drop files here
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  or click to select files
                </Typography>
              </Box>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Uploaded Files
                  </Typography>
                  <Stack spacing={2}>
                    {uploadedFiles.map((file, index) => (
                      <Paper key={index} sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" sx={{ flex: 1 }}>
                            {file.name}
                          </Typography>
                          {file.status === 'success' && (
                            <Chip
                              label="Success"
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          )}
                          {file.status === 'error' && (
                            <Chip
                              label="Error"
                              size="small"
                              color="error"
                              variant="outlined"
                            />
                          )}
                        </Box>
                        {file.status === 'uploading' && (
                          <Box sx={{ width: '100%', bgcolor: 'background.default', borderRadius: 1 }}>
                            <Box
                              sx={{
                                width: `${file.progress}%`,
                                height: 4,
                                bgcolor: 'primary.main',
                                borderRadius: 1,
                                transition: 'width 0.2s'
                              }}
                            />
                          </Box>
                        )}
                        {file.error && (
                          <Typography variant="caption" color="error">
                            {file.error}
                          </Typography>
                        )}
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
};

export default DataCatalogView; 
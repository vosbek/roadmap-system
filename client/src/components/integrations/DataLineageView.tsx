import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls,
  Position,
  MarkerType,
  Node,
  Edge,
  OnNodesChange,
  applyNodeChanges,
  NodeChange,
  ConnectionLineType,
  Connection,
  Edge as FlowEdge,
  Handle
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert,
  Paper,
  Autocomplete,
  TextField,
  IconButton,
  Tooltip,
  Chip,
  alpha,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import InfoIcon from '@mui/icons-material/Info';
import StorageIcon from '@mui/icons-material/Storage';
import ApiIcon from '@mui/icons-material/Api';
import WebIcon from '@mui/icons-material/Web';
import BusinessIcon from '@mui/icons-material/Business';
import SettingsIcon from '@mui/icons-material/Settings';
import FolderIcon from '@mui/icons-material/Folder';
import QueueIcon from '@mui/icons-material/Queue';
import dagre from 'dagre';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface GraphNode {
  id: string;
  name: string;
  type: string;
  dataTypes: string[];
  businessDomains: string[];
}

interface GraphLink {
  source: string;
  target: string;
  type: string;
  dataTypes: string[];
  businessDomains: string[];
}

interface NodeDetailsData extends GraphNode {
  incomingConnections: Array<{
    from: GraphNode;
    type: string;
    dataTypes: string[];
  }>;
  outgoingConnections: Array<{
    to: GraphNode;
    type: string;
    dataTypes: string[];
  }>;
}

const getSystemIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'web application':
      return <WebIcon />;
    case 'database':
      return <StorageIcon />;
    case 'api':
      return <ApiIcon />;
    case 'external entity':
      return <BusinessIcon />;
    case 'service':
      return <SettingsIcon />;
    case 'queue':
      return <QueueIcon />;
    case 'file system':
      return <FolderIcon />;
    default:
      return <StorageIcon />;
  }
};

const getSystemColor = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'web application':
      return '#10B981'; // Emerald 500
    case 'database':
      return '#3B82F6'; // Blue 500
    case 'api':
      return '#F59E0B'; // Amber 500
    case 'external entity':
      return '#6B7280'; // Gray 500
    case 'service':
      return '#EC4899'; // Pink 500
    case 'queue':
      return '#14B8A6'; // Teal 500
    case 'file system':
      return '#6366F1'; // Indigo 500
    default:
      return '#9CA3AF'; // Gray 400
  }
};

const getLayoutedElements = (nodes: any[], edges: any[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  // Increase spacing for better readability
  dagreGraph.setGraph({ 
    rankdir: 'LR',
    ranksep: 200,
    nodesep: 100,
    edgesep: 80,
    marginx: 50,
    marginy: 50
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 200, height: 100 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWithPosition.width / 2,
        y: nodeWithPosition.y - nodeWithPosition.height / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

const SYSTEM_TYPES = [
  'Web Application',
  'Database',
  'API',
  'External Entity',
  'Service',
  'Queue',
  'File System'
];

const BUSINESS_DOMAINS = [
  'Commission Data',
  'Annuity Data',
  'Customer Data',
  'Product Data',
  'Financial Data',
  'Operational Data'
];

const INTEGRATION_TYPES = [
  'Database',
  'API',
  'File',
  'Message Queue',
  'ETL',
  'Direct'
];

interface NewNodeData {
  name: string;
  type: string;
  dataTypes: string[];
  businessDomains: string[];
}

interface NewEdgeData {
  type: string;
  dataTypes: string[];
  businessDomains: string[];
}

const CustomNode = ({ data }: { data: any }) => {
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: '#94A3B8',
          width: 8,
          height: 8,
          border: '2px solid white'
        }}
      />
      <Box sx={{ 
        p: 1, 
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1
      }}>
        <Box sx={{ 
          color: getSystemColor(data.type),
          transform: 'scale(1.2)',
          mb: 0.5
        }}>
          {getSystemIcon(data.type)}
        </Box>
        <Typography sx={{ 
          fontWeight: 600,
          fontSize: '0.9rem',
          color: '#1F2937'
        }}>
          {data.name}
        </Typography>
        <Typography sx={{ 
          fontSize: '0.75rem',
          color: '#6B7280'
        }}>
          {data.type}
        </Typography>
      </Box>
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: '#94A3B8',
          width: 8,
          height: 8,
          border: '2px solid white'
        }}
      />
    </>
  );
};

const nodeTypes = {
  custom: CustomNode
};

const DataLineageView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>([]);
  const [dataTypes, setDataTypes] = useState<string[]>([]);
  const [flowNodes, setFlowNodes] = useState<Node[]>([]);
  const [flowEdges, setFlowEdges] = useState<FlowEdge[]>([]);
  const [isAddNodeDialogOpen, setIsAddNodeDialogOpen] = useState(false);
  const [newNodeData, setNewNodeData] = useState<NewNodeData>({
    name: '',
    type: '',
    dataTypes: [],
    businessDomains: []
  });
  const [isAddEdgeDialogOpen, setIsAddEdgeDialogOpen] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);
  const [newEdgeData, setNewEdgeData] = useState<NewEdgeData>({
    type: '',
    dataTypes: [],
    businessDomains: []
  });
  const [selectedNode, setSelectedNode] = useState<NodeDetailsData | null>(null);
  const [isNodeDetailsOpen, setIsNodeDetailsOpen] = useState(false);
  const [newConnectionTarget, setNewConnectionTarget] = useState('');
  const [newConnectionType, setNewConnectionType] = useState('');
  const [connectionDirection, setConnectionDirection] = useState<'incoming' | 'outgoing'>('outgoing');

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setFlowNodes((nds) => applyNodeChanges(changes, nds));
    },
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [dtResponse, graphResponse] = await Promise.all([
          fetch('http://localhost:3001/api/integrations/datatypes'),
          fetch('http://localhost:3001/api/integrations/graph')
        ]);
        
        const dtData = await dtResponse.json();
        const graphData = await graphResponse.json();
        
        setDataTypes(dtData.map((dt: any) => dt.name));

        const nodesMap = new Map<string, GraphNode>();
        const linksArray: GraphLink[] = [];

        graphData.forEach((item: any) => {
          if (!nodesMap.has(item.source.id)) {
            nodesMap.set(item.source.id, {
              id: item.source.id,
              name: item.source.name,
              type: item.source.type || 'Unknown',
              dataTypes: item.source.dataTypes || [],
              businessDomains: item.source.businessDomains || []
            });
          }

          if (!nodesMap.has(item.target.id)) {
            nodesMap.set(item.target.id, {
              id: item.target.id,
              name: item.target.name,
              type: item.target.type || 'Unknown',
              dataTypes: item.target.dataTypes || [],
              businessDomains: item.target.businessDomains || []
            });
          }

          linksArray.push({
            source: item.source.id,
            target: item.target.id,
            type: item.integration.type,
            dataTypes: item.integration.dataTypes || [],
            businessDomains: item.integration.businessDomains || []
          });
        });

        setNodes(Array.from(nodesMap.values()));
        setLinks(linksArray);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data lineage information');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useMemo(() => {
    if (selectedDataTypes.length === 0) {
      setFlowNodes([]);
      setFlowEdges([]);
      return;
    }

    const relevantNodes = new Set<string>();

    nodes.forEach(node => {
      if (node.dataTypes.some(dt => selectedDataTypes.includes(dt))) {
        relevantNodes.add(node.id);
      }
    });

    links.forEach(link => {
      if (link.dataTypes.some(dt => selectedDataTypes.includes(dt))) {
        relevantNodes.add(link.source);
        relevantNodes.add(link.target);
      }
    });

    const filteredNodes = nodes
      .filter(node => relevantNodes.has(node.id))
      .map(node => ({
        id: node.id,
        type: 'custom',
        data: { 
          name: node.name,
          type: node.type
        },
        position: { x: 0, y: 0 },
        draggable: true,
        style: {
          background: '#fff',
          padding: '8px',
          borderRadius: '8px',
          border: `2px solid ${alpha(getSystemColor(node.type), 0.6)}`,
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          width: 180,
          height: 'auto',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
            borderColor: getSystemColor(node.type),
            transform: 'translateY(-2px)'
          }
        }
      }));

    const filteredEdges = links
      .filter(link => 
        relevantNodes.has(link.source) && 
        relevantNodes.has(link.target) &&
        link.dataTypes.some(dt => selectedDataTypes.includes(dt))
      )
      .map(link => ({
        id: `${link.source}-${link.target}`,
        source: link.source,
        target: link.target,
        label: link.type,
        type: 'smoothstep',
        animated: true,
        style: { 
          strokeWidth: 2,
          stroke: '#94A3B8'
        },
        labelStyle: { 
          fill: '#1F2937',
          fontSize: 12,
          fontWeight: 500
        },
        labelBgStyle: { 
          fill: '#F8FAFC',
          rx: 4,
          ry: 4
        },
        labelBgPadding: [8, 4],
        markerEnd: { 
          type: MarkerType.ArrowClosed,
          color: '#94A3B8'
        }
      }));

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      filteredNodes,
      filteredEdges
    );

    setFlowNodes(layoutedNodes);
    setFlowEdges(layoutedEdges);
  }, [nodes, links, selectedDataTypes]);

  const handleAddNode = async () => {
    try {
      // Generate a unique ID for the new node
      const newNodeId = `node-${Date.now()}`;
      
      // Create the new node with the generated ID
      const newNode: GraphNode = {
        id: newNodeId,
        name: newNodeData.name,
        type: newNodeData.type,
        dataTypes: newNodeData.dataTypes,
        businessDomains: newNodeData.businessDomains
      };

      // Add the new node to the local state
      setNodes(prevNodes => [...prevNodes, newNode]);

      // If there are selected data types and the new node has matching data types,
      // update the flow nodes to include the new node
      if (selectedDataTypes.length > 0 && 
          newNode.dataTypes.some(dt => selectedDataTypes.includes(dt))) {
        const newFlowNode = {
          id: newNode.id,
          type: 'custom',
          data: { 
            name: newNode.name,
            type: newNode.type
          },
          position: { 
            // Position the new node to the right of existing nodes
            x: Math.max(...flowNodes.map(n => n.position.x), 0) + 300,
            y: Math.max(...flowNodes.map(n => n.position.y), 0) + 100
          },
          draggable: true,
          style: {
            background: '#fff',
            padding: '8px',
            borderRadius: '8px',
            border: `2px solid ${alpha(getSystemColor(newNode.type), 0.6)}`,
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            width: 180,
            height: 'auto',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
              borderColor: getSystemColor(newNode.type),
              transform: 'translateY(-2px)'
            }
          }
        };
        
        setFlowNodes(prevNodes => [...prevNodes, newFlowNode]);
      }

      // Reset form and close dialog
      setNewNodeData({
        name: '',
        type: '',
        dataTypes: [],
        businessDomains: []
      });
      setIsAddNodeDialogOpen(false);
    } catch (err) {
      console.error('Error creating node:', err);
      setError('Failed to create new node');
    }
  };

  const onConnect = useCallback((connection: Connection) => {
    setPendingConnection(connection);
    setNewEdgeData({
      type: '',
      dataTypes: [],
      businessDomains: []
    });
    setIsAddEdgeDialogOpen(true);
  }, []);

  const handleAddEdge = () => {
    if (!pendingConnection) return;

    const newLink: GraphLink = {
      source: pendingConnection.source || '',
      target: pendingConnection.target || '',
      type: newEdgeData.type,
      dataTypes: newEdgeData.dataTypes,
      businessDomains: newEdgeData.businessDomains
    };

    // Add the new link to the local state
    setLinks(prevLinks => [...prevLinks, newLink]);

    // If the data types match current selection, add to flow edges
    if (selectedDataTypes.length === 0 || 
        newEdgeData.dataTypes.some(dt => selectedDataTypes.includes(dt))) {
      const newFlowEdge: FlowEdge = {
        id: `${newLink.source}-${newLink.target}`,
        source: newLink.source,
        target: newLink.target,
        label: newLink.type,
        type: 'smoothstep',
        animated: true,
        style: { 
          strokeWidth: 2,
          stroke: '#94A3B8'
        },
        labelStyle: { 
          fill: '#1F2937',
          fontSize: 12,
          fontWeight: 500
        },
        labelBgStyle: { 
          fill: '#F8FAFC',
          rx: 4,
          ry: 4
        },
        labelBgPadding: [8, 4],
        markerEnd: { 
          type: MarkerType.ArrowClosed,
          color: '#94A3B8'
        }
      };

      setFlowEdges(prevEdges => [...prevEdges, newFlowEdge]);
    }

    // Reset and close dialog
    setPendingConnection(null);
    setNewEdgeData({
      type: '',
      dataTypes: [],
      businessDomains: []
    });
    setIsAddEdgeDialogOpen(false);
  };

  const handleNodeDoubleClick = useCallback((event: any, node: Node) => {
    // Find the full node data
    const nodeData = nodes.find(n => n.id === node.id);
    if (!nodeData) return;

    // Get incoming and outgoing connections
    const incomingConnections = links
      .filter(link => link.target === node.id)
      .map(link => ({
        from: nodes.find(n => n.id === link.source)!,
        type: link.type,
        dataTypes: link.dataTypes
      }));

    const outgoingConnections = links
      .filter(link => link.source === node.id)
      .map(link => ({
        to: nodes.find(n => n.id === link.target)!,
        type: link.type,
        dataTypes: link.dataTypes
      }));

    // Set selected node with connections
    setSelectedNode({
      ...nodeData,
      incomingConnections,
      outgoingConnections
    });
    setIsNodeDetailsOpen(true);
  }, [nodes, links]);

  const handleAddConnection = () => {
    if (!selectedNode || !newConnectionTarget || !newConnectionType) return;

    const newLink: GraphLink = {
      source: connectionDirection === 'outgoing' ? selectedNode.id : newConnectionTarget,
      target: connectionDirection === 'outgoing' ? newConnectionTarget : selectedNode.id,
      type: newConnectionType,
      dataTypes: selectedNode.dataTypes,
      businessDomains: selectedNode.businessDomains
    };

    // Add the new link to the local state
    setLinks(prevLinks => [...prevLinks, newLink]);

    // If the data types match current selection, add to flow edges
    if (selectedDataTypes.length === 0 || 
        newLink.dataTypes.some(dt => selectedDataTypes.includes(dt))) {
      const newFlowEdge: FlowEdge = {
        id: `${newLink.source}-${newLink.target}`,
        source: newLink.source,
        target: newLink.target,
        label: newLink.type,
        type: 'smoothstep',
        animated: true,
        style: { 
          strokeWidth: 2,
          stroke: '#94A3B8'
        },
        labelStyle: { 
          fill: '#1F2937',
          fontSize: 12,
          fontWeight: 500
        },
        labelBgStyle: { 
          fill: '#F8FAFC',
          rx: 4,
          ry: 4
        },
        labelBgPadding: [8, 4],
        markerEnd: { 
          type: MarkerType.ArrowClosed,
          color: '#94A3B8'
        }
      };

      setFlowEdges(prevEdges => [...prevEdges, newFlowEdge]);
    }

    // Reset form
    setNewConnectionTarget('');
    setNewConnectionType('');
  };

  const renderNodeDetailsDialog = () => (
    <Dialog 
      open={isNodeDetailsOpen} 
      onClose={() => {
        setIsNodeDetailsOpen(false);
        setSelectedNode(null);
        setNewConnectionTarget('');
        setNewConnectionType('');
      }}
      maxWidth="sm"
      fullWidth
    >
      {selectedNode && (
        <>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ color: getSystemColor(selectedNode.type) }}>
                {getSystemIcon(selectedNode.type)}
              </Box>
              {selectedNode.name}
            </Box>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  System Type
                </Typography>
                <Typography>{selectedNode.type}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Data Types
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selectedNode.dataTypes.map((dt, i) => (
                    <Chip key={i} label={dt} size="small" />
                  ))}
                </Box>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Incoming Connections
                </Typography>
                <List dense>
                  {selectedNode.incomingConnections.map((conn, i) => (
                    <ListItem key={i}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <ArrowBackIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={conn.from.name}
                        secondary={`${conn.type} - ${conn.dataTypes.join(', ')}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Outgoing Connections
                </Typography>
                <List dense>
                  {selectedNode.outgoingConnections.map((conn, i) => (
                    <ListItem key={i}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <ArrowForwardIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={conn.to.name}
                        secondary={`${conn.type} - ${conn.dataTypes.join(', ')}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Business Domains
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  {selectedNode.businessDomains.length > 0 ? (
                    selectedNode.businessDomains.map((domain, i) => (
                      <Chip 
                        key={i} 
                        label={domain} 
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No business domains assigned
                    </Typography>
                  )}
                </Box>
                <FormControl fullWidth size="small">
                  <Autocomplete
                    multiple
                    options={BUSINESS_DOMAINS}
                    value={selectedNode.businessDomains}
                    onChange={(_, newValue) => {
                      setSelectedNode(prev => prev ? {
                        ...prev,
                        businessDomains: newValue
                      } : null);
                      // Update the main nodes state as well
                      setNodes(prevNodes => prevNodes.map(node => 
                        node.id === selectedNode.id 
                          ? { ...node, businessDomains: newValue }
                          : node
                      ));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Add Business Domain"
                        placeholder="Select business domains"
                        size="small"
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          label={option}
                          size="small"
                          color="secondary"
                          {...getTagProps({ index })}
                        />
                      ))
                    }
                  />
                </FormControl>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Add New Connection
                </Typography>
                <Stack spacing={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Connection Direction</InputLabel>
                    <Select
                      value={connectionDirection}
                      label="Connection Direction"
                      onChange={(e) => setConnectionDirection(e.target.value as 'incoming' | 'outgoing')}
                    >
                      <MenuItem value="incoming">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ArrowBackIcon fontSize="small" />
                          <Typography>Incoming Connection</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="outgoing">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ArrowForwardIcon fontSize="small" />
                          <Typography>Outgoing Connection</Typography>
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel>{connectionDirection === 'incoming' ? 'Connect From System' : 'Connect To System'}</InputLabel>
                    <Select
                      value={newConnectionTarget}
                      label={connectionDirection === 'incoming' ? 'Connect From System' : 'Connect To System'}
                      onChange={(e) => setNewConnectionTarget(e.target.value)}
                    >
                      {nodes
                        .filter(n => n.id !== selectedNode.id)
                        .map((node) => (
                          <MenuItem key={node.id} value={node.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ color: getSystemColor(node.type) }}>
                                {getSystemIcon(node.type)}
                              </Box>
                              {node.name}
                            </Box>
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel>Integration Type</InputLabel>
                    <Select
                      value={newConnectionType}
                      label="Integration Type"
                      onChange={(e) => setNewConnectionType(e.target.value)}
                    >
                      {INTEGRATION_TYPES.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Button
                    variant="contained"
                    onClick={handleAddConnection}
                    disabled={!newConnectionTarget || !newConnectionType}
                    startIcon={connectionDirection === 'incoming' ? <ArrowBackIcon /> : <ArrowForwardIcon />}
                  >
                    Add {connectionDirection === 'incoming' ? 'Incoming' : 'Outgoing'} Connection
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </DialogContent>
        </>
      )}
    </Dialog>
  );

  return (
    <Box sx={{ height: '100%', position: 'relative' }}>
      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}>
        <Paper sx={{ p: 2, width: 300 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterListIcon sx={{ mr: 1 }} />
            <Typography variant="subtitle1">Data Flow Filters</Typography>
            <Tooltip title="Select data types to visualize their flow through the system">
              <IconButton size="small" sx={{ ml: 1 }}>
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Autocomplete
            multiple
            options={dataTypes}
            value={selectedDataTypes}
            onChange={(_, newValue) => setSelectedDataTypes(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                size="small"
                label="Data Types"
                placeholder="Filter by data type"
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
        </Paper>
      </Box>

      {/* Add Node FAB */}
      <Fab 
        color="primary" 
        sx={{ 
          position: 'absolute', 
          bottom: 24, 
          right: 24, 
          zIndex: 1 
        }}
        onClick={() => setIsAddNodeDialogOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* Add Node Dialog */}
      <Dialog 
        open={isAddNodeDialogOpen} 
        onClose={() => setIsAddNodeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New System Node</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="System Name"
              fullWidth
              value={newNodeData.name}
              onChange={(e) => setNewNodeData(prev => ({ ...prev, name: e.target.value }))}
            />
            
            <FormControl fullWidth>
              <InputLabel>System Type</InputLabel>
              <Select
                value={newNodeData.type}
                label="System Type"
                onChange={(e) => setNewNodeData(prev => ({ ...prev, type: e.target.value }))}
              >
                {SYSTEM_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ color: getSystemColor(type) }}>
                        {getSystemIcon(type)}
                      </Box>
                      {type}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Autocomplete
              multiple
              options={dataTypes}
              value={newNodeData.dataTypes}
              onChange={(_, newValue) => setNewNodeData(prev => ({ ...prev, dataTypes: newValue }))}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Data Types"
                  placeholder="Select data types"
                />
              )}
            />

            <Autocomplete
              multiple
              options={BUSINESS_DOMAINS}
              value={newNodeData.businessDomains}
              onChange={(_, newValue) => setNewNodeData(prev => ({ ...prev, businessDomains: newValue }))}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Business Domains"
                  placeholder="Select business domains"
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddNodeDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddNode} 
            variant="contained"
            disabled={!newNodeData.name || !newNodeData.type}
          >
            Add System
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Edge Dialog */}
      <Dialog 
        open={isAddEdgeDialogOpen} 
        onClose={() => {
          setIsAddEdgeDialogOpen(false);
          setPendingConnection(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Integration</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Integration Type</InputLabel>
              <Select
                value={newEdgeData.type}
                label="Integration Type"
                onChange={(e) => setNewEdgeData(prev => ({ ...prev, type: e.target.value }))}
              >
                {INTEGRATION_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Autocomplete
              multiple
              options={dataTypes}
              value={newEdgeData.dataTypes}
              onChange={(_, newValue) => setNewEdgeData(prev => ({ ...prev, dataTypes: newValue }))}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Data Types"
                  placeholder="Select data types"
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setIsAddEdgeDialogOpen(false);
            setPendingConnection(null);
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddEdge} 
            variant="contained"
            disabled={!newEdgeData.type}
          >
            Add Integration
          </Button>
        </DialogActions>
      </Dialog>

      {renderNodeDetailsDialog()}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ height: 'calc(100vh - 100px)', mt: 8 }}>
          {selectedDataTypes.length === 0 ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%',
              color: 'text.secondary'
            }}>
              <Typography variant="h6">
                Select data types to visualize their flow through the system
              </Typography>
            </Box>
          ) : flowNodes.length === 0 ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%',
              color: 'text.secondary'
            }}>
              <Typography variant="h6">
                No data flows found for the selected data types
              </Typography>
            </Box>
          ) : (
            <ReactFlow
              nodes={flowNodes}
              edges={flowEdges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onNodeDoubleClick={handleNodeDoubleClick}
              fitView
              nodesDraggable={true}
              draggable={true}
              panOnDrag={true}
              zoomOnScroll={true}
              nodesFocusable={false}
              nodesConnectable={false}
              elementsSelectable={true}
              minZoom={0.5}
              maxZoom={1.5}
              defaultViewport={{ x: 0, y: 0, zoom: 1 }}
              connectionLineType={ConnectionLineType.SmoothStep}
              defaultEdgeOptions={{
                type: 'smoothstep',
                animated: true
              }}
              fitViewOptions={{
                padding: 0.2,
                minZoom: 0.5,
                maxZoom: 1.5
              }}
            >
              <Background color="#E2E8F0" gap={16} size={1} />
              <Controls 
                showInteractive={false}
                style={{
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
              />
            </ReactFlow>
          )}
        </Box>
      )}
    </Box>
  );
};

export default DataLineageView; 
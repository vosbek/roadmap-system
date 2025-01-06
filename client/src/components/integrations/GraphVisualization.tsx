import React, { useCallback, useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Box } from '@mui/material';
import { forceLink, forceX, forceY, forceManyBody, forceCenter } from 'd3-force';

interface Node {
  id: string;
  name: string;
  type: string;
  ecosystem?: string;
  color?: string;
  size?: number;
  x?: number;
  y?: number;
  z?: number;
}

interface Link {
  source: string | Node;
  target: string | Node;
  type: string;
  dataTypes?: string[];
  businessDomains?: string[];
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

interface GraphVisualizationProps {
  data: GraphData;
  onNodeClick?: (node: Node) => void;
  onLinkClick?: (link: Link) => void;
}

const getNodeColor = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'web application':
      return '#10B981'; // Emerald 500
    case 'admin system':
      return '#8B5CF6'; // Violet 500
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

const getLinkColor = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'api':
      return '#F59E0B'; // Amber 500
    case 'database':
      return '#3B82F6'; // Blue 500
    case 'file':
      return '#10B981'; // Emerald 500
    case 'event':
      return '#8B5CF6'; // Violet 500
    case 'stream':
      return '#EC4899'; // Pink 500
    default:
      return '#9CA3AF'; // Gray 400
  }
};

const getLinkDashArray = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'api':
      return ''; // Solid line
    case 'database':
      return '5,5'; // Dashed
    case 'file':
      return '10,10'; // Long dashed
    case 'event':
      return '2,2'; // Dotted
    case 'stream':
      return '15,5,5,5'; // Dash-dot
    default:
      return '';
  }
};

const GraphVisualization: React.FC<GraphVisualizationProps> = ({
  data,
  onNodeClick,
  onLinkClick
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const graphRef = useRef<any>();
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [hoveredLink, setHoveredLink] = useState<Link | null>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight || 700
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const paintNode = useCallback((node: Node, ctx: CanvasRenderingContext2D, globalScale: number) => {
    // Early return if coordinates are not ready
    if (typeof node.x !== 'number' || typeof node.y !== 'number' || 
        !isFinite(node.x) || !isFinite(node.y)) {
      return;
    }

    const label = node.name;
    const fontSize = Math.max(14, 16 / globalScale);
    ctx.font = `${fontSize}px Inter, system-ui, -apple-system, sans-serif`;
    const textWidth = ctx.measureText(label).width;
    const backgroundNodeSize = textWidth + 20/globalScale;
    const nodeSize = Math.max(12/globalScale, backgroundNodeSize/4);

    // Draw shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 10/globalScale;
    ctx.shadowOffsetX = 4/globalScale;
    ctx.shadowOffsetY = 4/globalScale;

    // Draw background for label
    const padding = 12/globalScale;
    const cornerRadius = 6/globalScale;
    
    ctx.beginPath();
    ctx.moveTo(node.x! - backgroundNodeSize/2 + cornerRadius, node.y! - fontSize/2 - padding);
    ctx.lineTo(node.x! + backgroundNodeSize/2 - cornerRadius, node.y! - fontSize/2 - padding);
    ctx.quadraticCurveTo(node.x! + backgroundNodeSize/2, node.y! - fontSize/2 - padding, 
                      node.x! + backgroundNodeSize/2, node.y! - fontSize/2 - padding + cornerRadius);
    ctx.lineTo(node.x! + backgroundNodeSize/2, node.y! + fontSize/2 + padding - cornerRadius);
    ctx.quadraticCurveTo(node.x! + backgroundNodeSize/2, node.y! + fontSize/2 + padding,
                      node.x! + backgroundNodeSize/2 - cornerRadius, node.y! + fontSize/2 + padding);
    ctx.lineTo(node.x! - backgroundNodeSize/2 + cornerRadius, node.y! + fontSize/2 + padding);
    ctx.quadraticCurveTo(node.x! - backgroundNodeSize/2, node.y! + fontSize/2 + padding,
                      node.x! - backgroundNodeSize/2, node.y! + fontSize/2 + padding - cornerRadius);
    ctx.lineTo(node.x! - backgroundNodeSize/2, node.y! - fontSize/2 - padding + cornerRadius);
    ctx.quadraticCurveTo(node.x! - backgroundNodeSize/2, node.y! - fontSize/2 - padding,
                      node.x! - backgroundNodeSize/2 + cornerRadius, node.y! - fontSize/2 - padding);
    ctx.closePath();
    
    // Reset shadow for clean background
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = node === hoveredNode ? '#FFFFFF' : 'rgba(255, 255, 255, 0.95)';
    ctx.fill();
    ctx.strokeStyle = getNodeColor(node.type);
    ctx.lineWidth = node === hoveredNode ? 3/globalScale : 2/globalScale;
    ctx.stroke();

    // Draw node circle with gradient
    const gradient = ctx.createRadialGradient(
      node.x!, node.y!, 0,
      node.x!, node.y!, nodeSize
    );
    const nodeColor = getNodeColor(node.type);
    gradient.addColorStop(0, nodeColor);
    gradient.addColorStop(1, adjustColor(nodeColor, -20));

    ctx.beginPath();
    ctx.arc(node.x!, node.y!, nodeSize, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2/globalScale;
    ctx.stroke();

    // Draw label
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#111827'; // Gray 900
    ctx.fillText(label, node.x!, node.y!);

    // Draw type indicator
    const typeLabel = node.type.charAt(0).toUpperCase();
    const typeFontSize = Math.max(8, 10 / globalScale);
    ctx.font = `${typeFontSize}px Inter, system-ui, -apple-system, sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(typeLabel, node.x!, node.y!);
  }, [hoveredNode]);

  const paintLink = useCallback((link: Link, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const start = typeof link.source === 'string' ? { x: 0, y: 0 } : link.source;
    const end = typeof link.target === 'string' ? { x: 0, y: 0 } : link.target;
    
    // Early return if coordinates are not ready
    if (typeof start.x !== 'number' || typeof start.y !== 'number' ||
        typeof end.x !== 'number' || typeof end.y !== 'number' ||
        !isFinite(start.x) || !isFinite(start.y) ||
        !isFinite(end.x) || !isFinite(end.y)) {
      return;
    }

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    const unitDx = dx / length;
    const unitDy = dy / length;
    
    const nodeSize = 25/globalScale;
    const startX = start.x! + unitDx * nodeSize;
    const startY = start.y! + unitDy * nodeSize;
    const endX = end.x! - unitDx * nodeSize;
    const endY = end.y! - unitDy * nodeSize;

    // Draw link shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 5/globalScale;
    ctx.shadowOffsetX = 2/globalScale;
    ctx.shadowOffsetY = 2/globalScale;

    // Draw curved link
    ctx.beginPath();
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const curvature = 0.2;
    const controlX = midX - curvature * (endY - startY);
    const controlY = midY + curvature * (endX - startX);
    
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(controlX, controlY, endX, endY);
    
    // Set link style
    ctx.strokeStyle = link === hoveredLink ? adjustColor(getLinkColor(link.type), 20) : getLinkColor(link.type);
    ctx.lineWidth = link === hoveredLink ? Math.max(2, 3/globalScale) : Math.max(1, 2/globalScale);
    ctx.setLineDash(getLinkDashArray(link.type).split(',').map(Number));
    ctx.stroke();
    ctx.setLineDash([]);

    // Reset shadow
    ctx.shadowColor = 'transparent';

    // Draw arrow
    const arrowLength = 16/globalScale;
    const arrowWidth = 8/globalScale;
    const arrowPos = 0.9; // Position along the curve (0-1)
    
    const arrowX = endX - unitDx * arrowLength;
    const arrowY = endY - unitDy * arrowLength;
    
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      arrowX + unitDy * arrowWidth,
      arrowY - unitDx * arrowWidth
    );
    ctx.lineTo(
      arrowX - unitDy * arrowWidth,
      arrowY + unitDx * arrowWidth
    );
    ctx.closePath();
    ctx.fillStyle = getLinkColor(link.type);
    ctx.fill();

    // Draw data type labels if link is hovered
    if (link === hoveredLink && link.dataTypes?.length) {
      const labelX = controlX;
      const labelY = controlY;
      const fontSize = Math.max(10, 12/globalScale);
      
      ctx.font = `${fontSize}px Inter, system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      
      link.dataTypes.forEach((dataType: string, index: number) => {
        const label = dataType;
        const textWidth = ctx.measureText(label).width;
        const padding = 6/globalScale;
        const verticalOffset = (index - (link.dataTypes!.length - 1) / 2) * (fontSize + padding * 2);
        
        // Draw pill-shaped background
        const bgHeight = fontSize + padding * 2;
        const bgWidth = textWidth + padding * 4;
        const cornerRadius = bgHeight / 2;
        
        ctx.beginPath();
        ctx.moveTo(labelX - bgWidth/2 + cornerRadius, labelY - bgHeight + verticalOffset);
        ctx.lineTo(labelX + bgWidth/2 - cornerRadius, labelY - bgHeight + verticalOffset);
        ctx.arc(labelX + bgWidth/2 - cornerRadius, labelY - bgHeight/2 + verticalOffset, cornerRadius, -Math.PI/2, Math.PI/2);
        ctx.lineTo(labelX - bgWidth/2 + cornerRadius, labelY + verticalOffset);
        ctx.arc(labelX - bgWidth/2 + cornerRadius, labelY - bgHeight/2 + verticalOffset, cornerRadius, Math.PI/2, -Math.PI/2);
        ctx.closePath();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fill();
        ctx.strokeStyle = getLinkColor(link.type);
        ctx.lineWidth = 1/globalScale;
        ctx.stroke();
        
        ctx.fillStyle = '#111827';
        ctx.fillText(label, labelX, labelY - padding + verticalOffset);
      });
    }
  }, [hoveredLink]);

  useEffect(() => {
    if (graphRef.current) {
      // Configure force simulation
      graphRef.current
        .d3Force('center', forceCenter(dimensions.width / 2, dimensions.height / 2))
        .d3Force('charge', forceManyBody()
          .strength(-1000) // Reduced strength for more stability
          .distanceMax(300) // Reduced max distance
          .distanceMin(50)  // Added minimum distance
        )
        .d3Force('link', forceLink()
          .id((d: any) => d.id)
          .distance(150)    // Reduced distance
          .strength(1)      // Increased strength for more stable links
        )
        .d3Force('x', forceX(dimensions.width / 2).strength(0.1))
        .d3Force('y', forceY(dimensions.height / 2).strength(0.1));

      // Warm up the simulation
      graphRef.current.d3ReheatSimulation();

      // Auto-zoom to fit after a delay
      setTimeout(() => {
        if (graphRef.current && data.nodes.length > 0) {
          graphRef.current.zoomToFit(400, 50);
        }
      }, 1000);
    }
  }, [dimensions, data]);

  // Helper function to adjust color brightness
  const adjustColor = (color: string, amount: number): string => {
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    let r = (num >> 16) + amount;
    let g = ((num >> 8) & 0x00FF) + amount;
    let b = (num & 0x0000FF) + amount;
    
    r = Math.min(Math.max(0, r), 255);
    g = Math.min(Math.max(0, g), 255);
    b = Math.min(Math.max(0, b), 255);
    
    return `#${(b | (g << 8) | (r << 16)).toString(16).padStart(6, '0')}`;
  };

  return (
    <Box ref={containerRef} sx={{ width: '100%', height: '100%', minHeight: 700 }}>
      <ForceGraph2D
        ref={graphRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={data}
        nodeLabel="name"
        nodeCanvasObject={paintNode}
        nodeCanvasObjectMode={() => 'replace'}
        linkCanvasObject={paintLink}
        linkCanvasObjectMode={() => 'replace'}
        onNodeClick={onNodeClick}
        onLinkClick={onLinkClick}
        onNodeHover={setHoveredNode}
        onLinkHover={setHoveredLink}
        d3VelocityDecay={0.4}
        d3AlphaDecay={0.01}
        cooldownTicks={100}
        nodeRelSize={6}
        linkDirectionalArrowLength={6}
        linkDirectionalArrowRelPos={0.9}
        enableNodeDrag={true}
        enableZoomInteraction={true}
        enablePanInteraction={true}
      />
    </Box>
  );
};

export default GraphVisualization; 
import { useMemo, useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  NodeProps,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { Element, ElementCategory } from '../data/elements';

interface CollectionGraphProps {
  elements: Element[];
  unlockedElements: string[];
  discoveredElements: string[];
}

const CATEGORY_COLORS: Record<ElementCategory, string> = {
  basic: '#F4A261',
  nature: '#4CAF50',
  animal: '#795548',
  plant: '#8BC34A',
  food: '#FFC107',
  object: '#9E9E9E',
  concept: '#E91E63',
};

function ElementNode({ data }: NodeProps) {
  const { label, symbol, category, discovered } = data as {
    label: string;
    symbol: string;
    category: ElementCategory;
    discovered: boolean;
  };
  const color = CATEGORY_COLORS[category] ?? '#9E9E9E';

  return (
    <div
      className={`graph-node ${discovered ? 'discovered' : 'undiscovered'}`}
      style={{ borderColor: discovered ? color : '#555' }}
    >
      <Handle type="target" position={Position.Top} style={{ visibility: 'hidden' }} />
      <div className="graph-node-symbol">{discovered ? symbol : '❓'}</div>
      <div className="graph-node-name">{discovered ? label : '???'}</div>
      <Handle type="source" position={Position.Bottom} style={{ visibility: 'hidden' }} />
    </div>
  );
}

const nodeTypes = { element: ElementNode };

const NODE_WIDTH = 110;
const NODE_HEIGHT = 60;

function buildLayout(elements: Element[], discoveredSet: Set<string>) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', nodesep: 40, ranksep: 70, marginx: 20, marginy: 20 });

  const elementMap = new Map(elements.map((e) => [e.id, e]));

  for (const el of elements) {
    g.setNode(el.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }

  const edgeList: { source: string; target: string; discovered: boolean }[] = [];

  for (const el of elements) {
    // Use only the first combination recipe to avoid duplicate edges
    if (el.combinations.length > 0) {
      const [parentA, parentB] = el.combinations[0];
      if (elementMap.has(parentA)) {
        const disc = discoveredSet.has(parentA) && discoveredSet.has(el.id);
        g.setEdge(parentA, el.id);
        edgeList.push({ source: parentA, target: el.id, discovered: disc });
      }
      if (parentB !== parentA && elementMap.has(parentB)) {
        const disc = discoveredSet.has(parentB) && discoveredSet.has(el.id);
        g.setEdge(parentB, el.id);
        edgeList.push({ source: parentB, target: el.id, discovered: disc });
      }
    }
  }

  dagre.layout(g);

  const nodes: Node[] = elements.map((el) => {
    const pos = g.node(el.id);
    const discovered = discoveredSet.has(el.id);
    return {
      id: el.id,
      type: 'element',
      position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 },
      data: {
        label: el.name,
        symbol: el.symbol,
        category: el.category,
        discovered,
        hint: el.hint,
      },
      draggable: false,
    };
  });

  const edges: Edge[] = edgeList.map((e, i) => ({
    id: `e-${e.source}-${e.target}-${i}`,
    source: e.source,
    target: e.target,
    animated: false,
    style: e.discovered
      ? { stroke: '#F4A261', strokeWidth: 1.5 }
      : { stroke: '#444', strokeWidth: 1, strokeDasharray: '5 3' },
  }));

  return { nodes, edges };
}

function CollectionGraph({
  elements,
  unlockedElements: _unlockedElements,
  discoveredElements,
}: CollectionGraphProps) {
  const discoveredSet = useMemo(() => new Set(discoveredElements), [discoveredElements]);

  const { initialNodes, initialEdges } = useMemo(() => {
    const { nodes, edges } = buildLayout(elements, discoveredSet);
    return { initialNodes: nodes, initialEdges: edges };
  }, [elements, discoveredSet]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const data = node.data as { discovered: boolean; hint: string; label: string };
      if (data.discovered) {
        setTooltip({
          x: node.position.x,
          y: node.position.y,
          text: `${data.label}: ${data.hint}`,
        });
      } else {
        setTooltip({
          x: node.position.x,
          y: node.position.y,
          text: 'Noch nicht entdeckt',
        });
      }
    },
    [],
  );

  const onPaneClick = useCallback(() => setTooltip(null), []);

  const progress = Math.round((discoveredElements.length / elements.length) * 100);

  return (
    <div className="collection-graph-wrapper">
      <div className="collection-graph-header">
        <div className="progress-text">
          {discoveredElements.length} / {elements.length} Elemente entdeckt ({progress}%)
        </div>
        <div className="progress-bar-outer">
          <div className="progress-bar-inner" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="collection-graph-container">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          fitView
          minZoom={0.1}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#333" gap={20} />
          <Controls showInteractive={false} />
          <MiniMap
            nodeColor={(n) => {
              const d = n.data as { discovered: boolean; category: ElementCategory };
              return d.discovered ? (CATEGORY_COLORS[d.category] ?? '#666') : '#444';
            }}
            maskColor="rgba(26, 26, 46, 0.8)"
            style={{ background: '#16213e' }}
          />
        </ReactFlow>

        {tooltip && (
          <div className="graph-tooltip" onClick={() => setTooltip(null)}>
            {tooltip.text}
          </div>
        )}
      </div>
    </div>
  );
}

export default CollectionGraph;

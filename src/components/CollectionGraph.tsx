import { useMemo, useCallback, useState } from 'react';
import {
  ReactFlow,
  ReactFlowInstance,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  NodeProps,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { elements, BASIC_ELEMENT_IDS, Element, ElementCategory } from '../data/elements';

interface CollectionGraphProps {
  /** Elements the player has named; undiscovered or still-open ones stay hidden. */
  unlockedElements: string[];
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
  const { label, symbol, category, discovered, matches } = data as {
    label: string;
    symbol: string;
    category: ElementCategory;
    discovered: boolean;
    matches: boolean;
  };
  const color = CATEGORY_COLORS[category] ?? '#9E9E9E';

  return (
    <div
      className={`graph-node ${discovered ? 'discovered' : 'undiscovered'} ${matches ? '' : 'search-dimmed'}`}
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

interface Link { source: string; target: string }

/** Positions depend only on the (static) recipe graph, so they are computed once. */
function buildLayout(all: Element[]) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', nodesep: 40, ranksep: 70, marginx: 20, marginy: 20 });

  const known = new Set(all.map(e => e.id));
  for (const el of all) g.setNode(el.id, { width: NODE_WIDTH, height: NODE_HEIGHT });

  const links: Link[] = [];
  for (const el of all) {
    if (el.combinations.length === 0) continue;
    const [a, b] = el.combinations[0];
    for (const parent of new Set([a, b])) {
      if (!known.has(parent)) continue;
      g.setEdge(parent, el.id);
      links.push({ source: parent, target: el.id });
    }
  }
  dagre.layout(g);

  const positions = new Map(all.map(el => {
    const pos = g.node(el.id);
    return [el.id, { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 }] as const;
  }));
  return { positions, links };
}

const LAYOUT = buildLayout(elements);

function CollectionGraph({ unlockedElements }: CollectionGraphProps) {
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'graph' | 'list'>('graph');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const discoveredSet = useMemo(() => new Set(unlockedElements), [unlockedElements]);
  const matches = useMemo(() => elements.filter(el => discoveredSet.has(el.id) && el.name.toLocaleLowerCase('de-AT').includes(query.toLocaleLowerCase('de-AT'))), [discoveredSet, query]);
  const matchingIds = useMemo(() => new Set(matches.map(element => element.id)), [matches]);

  const nodes: Node[] = useMemo(
    () =>
      elements.map(el => ({
        id: el.id,
        type: 'element',
        position: LAYOUT.positions.get(el.id) ?? { x: 0, y: 0 },
        data: { label: el.name, symbol: el.symbol, category: el.category, discovered: discoveredSet.has(el.id), hint: el.hint, matches: !query || matchingIds.has(el.id) },
        draggable: false,
      })),
    [discoveredSet, matchingIds, query],
  );

  // Edges are only drawn for discovered elements; showing them for hidden ones would give away the recipes.
  const edges: Edge[] = useMemo(
    () =>
      LAYOUT.links
        .filter(link => discoveredSet.has(link.target) && discoveredSet.has(link.source))
        .map(link => ({
          id: `e-${link.source}-${link.target}`,
          source: link.source,
          target: link.target,
          style: { stroke: '#F4A261', strokeWidth: 1.5 },
        })),
    [discoveredSet],
  );

  const [tooltip, setTooltip] = useState<string | null>(null);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const data = node.data as { discovered: boolean; hint: string; label: string };
    setSelectedId(data.discovered ? node.id : null);
    setTooltip(data.discovered ? `${data.label}: ${data.hint}` : 'Noch nicht entdeckt');
  }, []);

  const onPaneClick = useCallback(() => setTooltip(null), []);

  const onInit = useCallback((instance: ReactFlowInstance) => {
    let saved: string | null = null;
    try { saved = sessionStorage.getItem('linguafusion-collection-viewport'); } catch { /* Storage can be disabled. */ }
    if (saved) {
      try {
        const viewport = JSON.parse(saved) as { x: number; y: number; zoom: number };
        instance.setViewport(viewport);
        return;
      } catch { /* Fall back to the basics if the session value is invalid. */ }
    }
    instance.fitView({ nodes: BASIC_ELEMENT_IDS.map(id => ({ id })), maxZoom: 1.2, padding: 0.5 });
  }, []);

  const onMoveEnd = useCallback((_: unknown, viewport: { x: number; y: number; zoom: number }) => {
    try { sessionStorage.setItem('linguafusion-collection-viewport', JSON.stringify(viewport)); } catch { /* Viewport persistence is optional. */ }
  }, []);

  const progress = Math.floor((unlockedElements.length / elements.length) * 100);
  const selectedElement = selectedId ? elements.find(element => element.id === selectedId) : null;

  return (
    <div className="collection-graph-wrapper">
      <label className="collection-search">
        Sammlung durchsuchen
        <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Element suchen…" />
      </label>
      <div className="collection-view-controls" role="group" aria-label="Sammlungsansicht">
        <button type="button" aria-pressed={view === 'graph'} onClick={() => setView('graph')}>Graph</button>
        <button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')}>Liste</button>
        {query && <span aria-live="polite">{matches.length} Treffer</span>}
      </div>
      <div className="collection-graph-header">
        <div className="progress-text">
          {unlockedElements.length} / {elements.length} Elemente entdeckt ({progress}%)
        </div>
        <div className="progress-bar-outer">
          <div className="progress-bar-inner" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {view === 'list' ? (
        <div className="collection-list-view">
          {matches.length === 0 ? <p>Keine entdeckten Elemente passen zu deiner Suche.</p> : (
            <div className="collection-list">
              {matches.map(element => (
                <button key={element.id} type="button" aria-pressed={selectedId === element.id} onClick={() => setSelectedId(element.id)}>
                  <span aria-hidden="true">{element.symbol}</span> {element.name}
                </button>
              ))}
            </div>
          )}
          {selectedElement && discoveredSet.has(selectedElement.id) && (
            <aside className="collection-item-detail" aria-live="polite">
              <h3>{selectedElement.symbol} {selectedElement.name}</h3>
              <p>{selectedElement.hint}</p>
              {selectedElement.combinations.length > 0 && (
                <p>Entsteht aus: {selectedElement.combinations[0].map(id => elements.find(element => element.id === id)?.name ?? id).join(' + ')}</p>
              )}
            </aside>
          )}
        </div>
      ) : <div className="collection-graph-container">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onInit={onInit}
          onMoveEnd={onMoveEnd}
          minZoom={0.1}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#333" gap={20} />
          <Controls showInteractive={false} />
          <MiniMap
            nodeColor={n => {
              const d = n.data as { discovered: boolean; category: ElementCategory };
              return d.discovered ? (CATEGORY_COLORS[d.category] ?? '#666') : '#444';
            }}
            maskColor="rgba(26, 26, 46, 0.8)"
            style={{ background: '#16213e' }}
          />
        </ReactFlow>

        <div role="status">
          {tooltip && (
            <div className="graph-tooltip" onClick={() => setTooltip(null)}>
              {tooltip}
            </div>
          )}
        </div>
      </div>}
    </div>
  );
}

export default CollectionGraph;

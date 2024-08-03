import React, { useState, useRef } from 'react';
import { Box, ButtonGroup, IconButton } from '@mui/material';
import { Stage, Layer, Line } from 'react-konva';
import BrushIcon from '@mui/icons-material/Brush';
import CreateIcon from '@mui/icons-material/Create';
import ClearIcon from '@mui/icons-material/Clear';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import EraserIcon from '@mui/icons-material/FormatColorReset';
import BorderHorizontalIcon from '@mui/icons-material/BorderHorizontal';
import GridOnIcon from '@mui/icons-material/GridOn';
import ImageIcon from '@mui/icons-material/Image';

interface LineData {
  tool: string;
  points: number[];
  strokeColor: string;
  strokeWidth: number;
}

const canvasStyles = {
  simple: {
    hideGrid: true,
  },
  horizontalLines: {
    hideGrid: false,
    gridColor: 'black',
    gridSizeX: 10000, // Very large value to create horizontal lines
    gridSizeY: 40, // Spacing for horizontal lines
    gridLineWidth: 1,
    hideGridX: true,
    hideGridY: false,
  },
  mathGrid: {
    hideGrid: false,
    gridColor: 'black',
    gridSizeX: 40, // Grid size for math grid
    gridSizeY: 40,
    gridLineWidth: 1,
    hideGridX: false,
    hideGridY: false,
  },
};

const InteractionBoard: React.FC = () => {
  const [canvasStyle, setCanvasStyle] = useState('simple');
  const [brushColor, setBrushColor] = useState("#444");
  const [brushRadius, setBrushRadius] = useState(12);
  const [lines, setLines] = useState<LineData[]>([]);
  const isDrawing = useRef(false);

  const clearCanvas = () => {
    setLines([]);
  };

  const undoLast = () => {
    setLines(lines.slice(0, -1));
  };

  const redoLast = () => {
    // Implement redo functionality if needed
  };

  const setPencil = (color: string, radius: number) => {
    setBrushColor(color);
    setBrushRadius(radius);
  };

  const changeCanvasStyle = (style: string) => {
    setCanvasStyle(style);
    clearCanvas(); // Clear the canvas when changing styles
  };

  const handleMouseDown = (e: any) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { tool: 'pen', points: [pos.x, pos.y], strokeColor: brushColor, strokeWidth: brushRadius }]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const renderGrid = () => {
    if (canvasStyle === 'simple') return null;
    const { gridColor, gridSizeX, gridSizeY, gridLineWidth, hideGridX, hideGridY } = canvasStyles[canvasStyle];
    const width = window.innerWidth;
    const height = window.innerHeight;

    const gridLines: JSX.Element[] = [];

    if (!hideGridY) {
      for (let i = 0; i <= height; i += gridSizeY) {
        gridLines.push(<Line key={`h-${i}`} points={[0, i, width, i]} stroke={gridColor} strokeWidth={gridLineWidth} />);
      }
    }

    if (!hideGridX) {
      for (let i = 0; i <= width; i += gridSizeX) {
        gridLines.push(<Line key={`v-${i}`} points={[i, 0, i, height]} stroke={gridColor} strokeWidth={gridLineWidth} />);
      }
    }

    return <Layer>{gridLines}</Layer>;
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', mt: 2 }}>
      <Box sx={{ mb: 2, display: 'flex', gap: 1, flexDirection: 'row', justifyContent: 'space-between', background: 'grey', width: '100%' }}>
        <ButtonGroup size="small" variant="contained">
          <IconButton onClick={() => changeCanvasStyle('simple')}><ImageIcon /></IconButton>
          <IconButton onClick={() => changeCanvasStyle('horizontalLines')}><BorderHorizontalIcon /></IconButton>
          <IconButton onClick={() => changeCanvasStyle('mathGrid')}><GridOnIcon /></IconButton>
        </ButtonGroup>
        <ButtonGroup size="small" variant="contained">
          <IconButton onClick={() => setPencil("#000", 2)}><CreateIcon /></IconButton>
          <IconButton onClick={() => setPencil("#000", 4)}><BrushIcon /></IconButton>
          <IconButton onClick={() => setPencil("#f00", 2)}><CreateIcon style={{ color: 'red' }} /></IconButton>
          <IconButton onClick={() => setPencil("#f00", 4)}><BrushIcon style={{ color: 'red' }} /></IconButton>
          <IconButton onClick={() => setPencil("#fff", 10)}><EraserIcon /></IconButton>
        </ButtonGroup>
        <ButtonGroup size="small" variant="contained">
          <IconButton onClick={clearCanvas}><ClearIcon /></IconButton>
          <IconButton onClick={undoLast}><UndoIcon /></IconButton>
          <IconButton onClick={redoLast}><RedoIcon /></IconButton>
        </ButtonGroup>
      </Box>
      <Box sx={{ flex: 1, width: '100%', height: '100%', position: 'relative' }}>
        <Stage
          width={window.innerWidth}
          height={window.innerHeight}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {renderGrid()}
          <Layer>
            {lines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke={line.strokeColor}
                strokeWidth={line.strokeWidth}
                tension={0.5}
                lineCap="round"
                globalCompositeOperation={
                  line.strokeColor === "#fff" ? "destination-out" : "source-over"
                }
              />
            ))}
          </Layer>
        </Stage>
      </Box>
    </Box>
  );
};

export default InteractionBoard;

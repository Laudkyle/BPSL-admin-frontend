// components/DraggableRow.js
import { Draggable } from 'react-beautiful-dnd';

const DraggableRow = ({ row, index, children }) => {
  return (
    <Draggable draggableId={row.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            background: snapshot.isDragging ? 'rgba(245, 245, 245, 0.8)' : 'white',
          }}
        >
          {children}
        </div>
      )}
    </Draggable>
  );
};

export default DraggableRow;
import React from 'react';
import Tree from 'react-d3-tree';

const containerStyles = {
  width: '100%',
  height: '100vh',
};

const renderRectSvgNode = ({ nodeDatum, toggleNode, onArraySelect, visibleNodeProperties }) => {
  if (nodeDatum.isMissing) {
    // Render a rectangle with red border and 'Not found' label
    const nodeHeight = 60;
    return (
      <g>
        <rect width="160" height={nodeHeight} x="-80" y={-nodeHeight / 2} fill="#fff" stroke="#ff4d4f" strokeWidth="3" />
        <foreignObject x="-80" y={-nodeHeight / 2} width="160" height={nodeHeight}>
          <div style={{
            width: '160px',
            height: `${nodeHeight}px`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#b30000',
            fontWeight: 'bold',
            fontSize: '14px',
            background: 'rgba(255,240,240,0.8)'
          }}>
            <div style={{ fontSize: '16px', marginBottom: '6px' }}>Not found</div>
            <div style={{ fontSize: '11px', color: '#b30000' }}>{nodeDatum.name.replace('Missing: ', '')}</div>
          </div>
        </foreignObject>
      </g>
    );
  }
  const arrayKeys = Object.keys(nodeDatum).filter(key =>
    (Array.isArray(nodeDatum[key]) || (typeof nodeDatum[key] === 'object' && nodeDatum[key] !== null && !Array.isArray(nodeDatum[key]))) &&
    key !== 'children' && key !== 'edges' && !key.startsWith('__')
  );

  // Extract string properties to display
  const stringProps = ['id', 'name', 'group', 'type', 'status'].filter(
    prop => nodeDatum[prop] && typeof nodeDatum[prop] === 'string' && visibleNodeProperties[prop] === true
  );

  const handleDropdownChange = (event) => {
    event.stopPropagation();
    const selectedKey = event.target.value;
    if (selectedKey) {
      onArraySelect(nodeDatum[selectedKey], selectedKey, nodeDatum.name);
    }
  };

  const baseNodeHeight = 60;
  const propertyHeight = stringProps.length > 0 ? stringProps.length * 15 : 0;
  const dropdownHeight = arrayKeys.length > 0 ? 25 : 0;
  const nodeHeight = baseNodeHeight + propertyHeight + (dropdownHeight > 0 ? 10 : 0) + dropdownHeight;

  // Count immediate children
  const childCount = Array.isArray(nodeDatum.children) ? nodeDatum.children.length : 0;
  return (
    <g>
      <rect width="160" height={nodeHeight} x="-80" y={-nodeHeight / 2} fill="white" stroke="black" onClick={toggleNode} />
      <foreignObject x="-80" y={-nodeHeight / 2} width="160" height={nodeHeight}>
        <div style={{
          width: '160px',
          height: `${nodeHeight}px`,
          display: 'flex',
          flexDirection: 'column',
          padding: '5px',
          boxSizing: 'border-box',
          textAlign: 'center',
          color: 'black',
          fontSize: '12px',
        }}>
          <div onClick={toggleNode} style={{ fontWeight: 'bold', marginBottom: '2px', cursor: 'pointer', minHeight: '20px' }}>
            {nodeDatum.name}
          </div>
          <div style={{ fontSize: '10px', color: '#555', marginBottom: '3px' }}>
            {`Children: ${childCount}`}
          </div>
          {stringProps.length > 0 && (
            <div style={{ fontSize: '10px', marginBottom: '5px', lineHeight: '1.4' }}>
              {stringProps.map(prop => (
                <div key={prop} style={{ margin: '2px 0', textAlign: 'left', paddingLeft: '5px' }}>
                  <strong>{prop}:</strong> {String(nodeDatum[prop]).substring(0, 20)}
                </div>
              ))}
            </div>
          )}
          {arrayKeys.length > 0 && (
            <div style={{ marginTop: 'auto' }} onClick={(e) => e.stopPropagation()}>
              <select onChange={handleDropdownChange} onClick={(e) => e.stopPropagation()} style={{ fontSize: '11px', width: '100%' }}>
                <option value="">Select data...</option>
                {arrayKeys.map(key => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </foreignObject>
    </g>
  );
};

export default class MyTree extends React.Component {
  constructor(props) {
    super(props);
    this.containerRef = React.createRef();
    this.state = { translate: { x: 0, y: 0 } };
  }

  componentDidMount() {
    this.setContainerCenter();
    window.addEventListener('resize', this.setContainerCenter);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.setContainerCenter);
  }

  setContainerCenter = () => {
    if (this.containerRef.current) {
      const { offsetWidth, offsetHeight } = this.containerRef.current;
      this.setState({ translate: { x: offsetWidth / 2, y: offsetHeight / 4 } });
    }
  };

  render() {
    const separation = { siblings: 2, nonSiblings: 2.5 };
    return (
      <div style={containerStyles} ref={this.containerRef}>
        <Tree
          data={this.props.data}
          renderCustomNodeElement={(rd3tProps) => renderRectSvgNode({ ...rd3tProps, onArraySelect: this.props.onArraySelect, visibleNodeProperties: this.props.visibleNodeProperties })}
          orientation="vertical"
          pathFunc="straight"
          separation={separation}
          translate={this.state.translate}
        />
      </div>
    );
  }
}

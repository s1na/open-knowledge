pragma solidity ^0.4.23;

import "./Graph.sol";

contract GraphRegistry {
  event NewGraph(
    address addr
  );

  bytes32[] public graphIndices;
  mapping(bytes32 => address) public graphs;

  constructor() public {
    newGraph('default');
  }

  function newGraph(bytes32 _name) public returns(address addr) {
    require(graphs[_name] == 0);

    Graph g = new Graph(msg.sender);
    graphs[_name] = g;
    graphIndices.push(_name);
    emit NewGraph(g);

    return g;
  }

  function getGraphsCount() public constant returns(uint) {
    return graphIndices.length;
  }

  function getGraphName(uint _i) public constant returns(bytes32) {
    require(_i < graphIndices.length);
    return graphIndices[_i];
  }
}

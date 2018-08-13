pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "zos-lib/contracts/migrations/Migratable.sol";

import "./Graph.sol";


contract SimpleRegistry is Ownable, Migratable {
  event NewGraph(
    address addr
  );

  bytes32[] public graphIndices;
  mapping(bytes32 => address) public graphs;

  function initialize() isInitializer("SimpleRegistry", "0") public {
    newGraph("default");
  }

  function newGraph(bytes32 _name) public returns(address addr) {
    require(graphs[_name] == 0);

    Graph g = new Graph();
    g.initialize(msg.sender, _name);
    graphs[_name] = g;
    graphIndices.push(_name);
    emit NewGraph(g);

    return g;
  }

  function getGraphsCount() public view returns(uint) {
    return graphIndices.length;
  }

  function getGraphName(uint _i) public view returns(bytes32) {
    require(_i < graphIndices.length);
    return graphIndices[_i];
  }
}

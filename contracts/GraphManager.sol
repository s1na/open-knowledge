pragma solidity ^0.4.23;

contract GraphManager {
  event RootUpdated(
    bytes root
  );

  address public owner;
  bytes public root = hex'017112200d511ee9a3ab4e52e8e2bc40fd2669d9c44b89164107e9898cd9698c1506c5aa';

  constructor(address _owner) public {
    owner = _owner;
  }

  modifier restricted() {
    if (msg.sender == owner) _;
  }

  function setRoot(bytes _root) public restricted {
    root = _root;
    emit RootUpdated(_root);
  }
}
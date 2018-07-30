pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "zos-lib/contracts/migrations/Migratable.sol";


contract Graph is Ownable, Migratable {
  event RootUpdated(
    bytes root,
    uint32 indexed version
  );

  event DiffUpdated(
    bytes diff
  );

  bytes32 public id;
  bytes public root;
  bytes public diff;
  uint32 public version;

  function initialize(address _owner, bytes32 _id) isInitializer("Graph", "0") public {
    owner = _owner;
    id = _id;
    root = hex"017112200d511ee9a3ab4e52e8e2bc40fd2669d9c44b89164107e9898cd9698c1506c5aa";
    emit RootUpdated(root, version);
  }

  function setId(bytes32 _id) public onlyOwner {
    id = _id;
  }

  function setRoot(bytes _root) public onlyOwner {
    root = _root;
    version++;
    emit RootUpdated(_root, version);
  }

  function setDiff(bytes _diff) public onlyOwner {
    diff = _diff;
    emit DiffUpdated(_diff);
  }
}

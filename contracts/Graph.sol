pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "zos-lib/contracts/migrations/Migratable.sol";


contract Graph is Ownable, Migratable {
  event RootUpdated(
    bytes root
  );

  event DiffUpdated(
    bytes diff
  );

  bytes public root = hex"017112200d511ee9a3ab4e52e8e2bc40fd2669d9c44b89164107e9898cd9698c1506c5aa";
  bytes public diff;

  function initialize(address _owner) isInitializer("Graph", "0") public {
    owner = _owner;
  }

  function setRoot(bytes _root) public onlyOwner {
    root = _root;
    emit RootUpdated(_root);
  }

  function setDiff(bytes _diff) public onlyOwner {
    diff = _diff;
    emit DiffUpdated(_diff);
  }
}

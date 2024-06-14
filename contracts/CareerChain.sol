// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

// TODO: IN Edit Employee event emit timestamp as well

contract CareerChain is Ownable {
  //STRUCTS HERE

  struct Organization {
    mapping(uint256 => Certificate) certificates;
    mapping(uint256 => Employement) employees;
    uint256 totalEmployees;
    uint256 totalCerts;
    uint256 availablePoints;
    bool valid;
    uint256 planID;
    uint256 planEndAt;
  }

  struct Personal {
    mapping(uint256 => AwardedCert) certificates;
    address curEmployer;
    uint256 totalCerts;
    uint256 points;
    bool valid;
  }

  struct Certificate {
    uint256 certIndex;
    address createdBy;
    string name;
    string description;
    string imageHash;
    address[] awardedTo;
    bool valid;
  }

  struct AwardedCert {
    address orgAddress;
    uint256 certIndex;
  }

  struct Employement {
    uint256 empIndex;
    address employer;
    address employee;
    uint256 startedAt;
    uint256 endedAt;
    bool active;
    EmployementPromotion[] promotions;
  }

  struct EmployementPromotion {
    string jobTitle;
    string position;
    uint256 startedAt;
    uint256 endedAt;
  }

  //EVENTS HERE

  event CertificateCreated(
    uint256 certIndex,
    address indexed creator,
    string name,
    string description,
    string imageHash,
    uint256 timestamp
  );

  event CertificateAwarded(uint256 certIndex, address indexed org, address indexed awardedTo, uint256 timestamp);

  event PointAwarded(
    address indexed awardedBy,
    address indexed awardedTo,
    uint256 amount,
    string reason,
    uint256 timestamp
  );

  event EmployeeAdded(
    uint256 empIndex,
    address indexed employer,
    address indexed employee,
    string jobTitle,
    string position,
    uint256 startedAt,
    uint256 endedAt,
    uint256 timestamp
  );

  event EmployeeEdit(
    uint256 empIndex,
    address indexed employer,
    address indexed employee,
    uint256 endedAt,
    uint256 timestamp
  );

  event Promoted(
    uint256 empIndex,
    address indexed employer,
    address indexed employee,
    string jobTitle,
    string position,
    uint256 timestamp
  );

  event VerifyOrganization(string verificationKey, address indexed orgAddress, uint256 timestamp);

  //MAPPINGS HERE

  mapping(address => Organization) public allOrganization;
  mapping(address => Personal) public allPersonal;

  constructor(address initialOwner) Ownable(initialOwner) {}

  function buySubscription(uint256 planID) external payable {
    require(allOrganization[msg.sender].valid, "You are not an organization");
    require(msg.value > 0, "No Ether sent");
    require(planID >= 1 && planID <= 3, "Invalid Plan ID");

    if (planID == 1) {
      allOrganization[msg.sender].availablePoints += 50;
      allOrganization[msg.sender].planEndAt = block.timestamp + 30 days;
    } else if (planID == 2) {
      allOrganization[msg.sender].availablePoints += 300;
      allOrganization[msg.sender].planEndAt = block.timestamp + 180 days;
    } else if (planID == 3) {
      allOrganization[msg.sender].availablePoints += 600;
      allOrganization[msg.sender].planEndAt = block.timestamp + 365 days;
    }

    allOrganization[msg.sender].planID = planID;
  }

  function addPromotion(uint256 empIndex, string calldata jobTitle, string calldata position) public {
    require(allOrganization[msg.sender].valid, "You are not an organization");

    Employement storage employment = allOrganization[msg.sender].employees[empIndex];

    // Add a new promotion to the promotions array
    employment.promotions.push(
      EmployementPromotion({jobTitle: jobTitle, position: position, startedAt: block.timestamp, endedAt: 0})
    );

    uint256 promotionsLength = allOrganization[msg.sender].employees[empIndex].promotions.length;
    allOrganization[msg.sender].employees[empIndex].promotions[promotionsLength - 2].endedAt = block.timestamp;

    allOrganization[msg.sender].employees[empIndex].endedAt = 0;

    emit Promoted(
      empIndex,
      msg.sender,
      allOrganization[msg.sender].employees[empIndex].employee,
      jobTitle,
      position,
      block.timestamp
    );
  }

  function addEmployee(
    address employee,
    string calldata jobTitle,
    string calldata position,
    uint256 startedAt,
    uint256 endedAt
  ) public {
    require(allOrganization[msg.sender].valid, "You are not an organization");

    bool active = false;

    if (endedAt == 0) {
      active = true;
    }

    uint256 curIndex = allOrganization[msg.sender].totalEmployees;

    // Create the employment struct in storage
    Employement storage newEmployment = allOrganization[msg.sender].employees[curIndex];

    newEmployment.empIndex = curIndex;
    newEmployment.employer = msg.sender;
    newEmployment.employee = employee;
    newEmployment.startedAt = startedAt;
    newEmployment.endedAt = endedAt;
    newEmployment.active = active;
    newEmployment.promotions.push(
      EmployementPromotion({jobTitle: jobTitle, position: position, startedAt: startedAt, endedAt: endedAt})
    );

    allOrganization[msg.sender].totalEmployees++;

    if (!allPersonal[employee].valid) {
      allPersonal[employee].totalCerts = 0;
      allPersonal[employee].valid = true;
    }

    allPersonal[employee].curEmployer = msg.sender;

    emit EmployeeAdded(curIndex, msg.sender, employee, jobTitle, position, startedAt, endedAt, block.timestamp);
  }

  function editEmployee(uint256 empIndex, uint256 endedAt) public {
    require(allOrganization[msg.sender].valid, "You are not an organization");

    bool active = false;

    if (endedAt == 0) {
      active = true;
    }

    allOrganization[msg.sender].employees[empIndex].endedAt = endedAt;
    allOrganization[msg.sender].employees[empIndex].active = active;

    uint256 promotionsLength = allOrganization[msg.sender].employees[empIndex].promotions.length;
    allOrganization[msg.sender].employees[empIndex].promotions[promotionsLength - 1].endedAt = endedAt;

    emit EmployeeEdit(
      empIndex,
      msg.sender,
      allOrganization[msg.sender].employees[empIndex].employee,
      endedAt,
      block.timestamp
    );
  }

  function getOrgAllEmployee(address orgAddress) public view returns (Employement[] memory) {
    uint256 numEmployees = allOrganization[orgAddress].totalEmployees;
    Employement[] memory employees = new Employement[](numEmployees);

    for (uint256 i = 0; i < numEmployees; i++) {
      employees[i] = allOrganization[orgAddress].employees[i];
    }

    return employees;
  }

  function createOrganization(address orgAddress, string calldata verificationKey) public onlyOwner {
    require(!allOrganization[orgAddress].valid, "You are already a organization");
    allOrganization[orgAddress].totalCerts = 0;
    allOrganization[orgAddress].availablePoints = 50;
    allOrganization[orgAddress].valid = true;

    emit VerifyOrganization(verificationKey, orgAddress, block.timestamp);
  }

  function createCertificate(string calldata name, string calldata description, string calldata imageHash) public {
    require(allOrganization[msg.sender].valid, "You are not an organization");

    uint256 curCertIndex = allOrganization[msg.sender].totalCerts;
    allOrganization[msg.sender].certificates[curCertIndex] = Certificate(
      curCertIndex,
      msg.sender,
      name,
      description,
      imageHash,
      new address[](0),
      true
    );

    allOrganization[msg.sender].totalCerts++;

    emit CertificateCreated(curCertIndex, msg.sender, name, description, imageHash, block.timestamp);
  }

  function getPersonalAllCertificates(address personalAddress) public view returns (Certificate[] memory) {
    uint256 _totalCerts = allPersonal[personalAddress].totalCerts;
    Certificate[] memory certificates = new Certificate[](_totalCerts);
    for (uint256 i = 0; i < _totalCerts; i++) {
      address orgAddress = allPersonal[personalAddress].certificates[i].orgAddress;
      uint256 certIndex = allPersonal[personalAddress].certificates[i].certIndex;
      certificates[i] = getOrgCertificate(orgAddress, certIndex);
    }

    return certificates;
  }

  function getOrgCertificate(address orgAddress, uint256 certIndex) public view returns (Certificate memory) {
    require(allOrganization[orgAddress].certificates[certIndex].valid, "Not valid certificate index");
    return allOrganization[orgAddress].certificates[certIndex];
  }

  function getOrgAllCertificates(address orgAddress) public view returns (Certificate[] memory) {
    uint256 _totalCerts = allOrganization[orgAddress].totalCerts;
    Certificate[] memory certificates = new Certificate[](_totalCerts);
    for (uint256 i = 0; i < _totalCerts; i++) {
      certificates[i] = allOrganization[orgAddress].certificates[i];
    }
    return certificates;
  }

  function awardCertificate(uint256 certId, address awardee) public {
    require(allOrganization[msg.sender].valid, "You are not an organization");

    require(allOrganization[msg.sender].certificates[certId].valid, "Invalid certificate id for this organization");

    for (uint256 i = 0; i < allOrganization[msg.sender].certificates[certId].awardedTo.length; i++) {
      if (allOrganization[msg.sender].certificates[certId].awardedTo[i] == awardee) {
        revert("Address is already in the awarded list");
      }
    }

    if (!allPersonal[awardee].valid) {
      allPersonal[awardee].totalCerts = 0;
      allPersonal[awardee].valid = true;
    }

    allPersonal[awardee].certificates[allPersonal[awardee].totalCerts] = AwardedCert(msg.sender, certId);
    allPersonal[awardee].totalCerts++;
    allOrganization[msg.sender].certificates[certId].awardedTo.push(awardee);

    emit CertificateAwarded(certId, msg.sender, awardee, block.timestamp);
  }

  function awardPoints(address awardee, uint256 amount, string calldata reason) public {
    require(allOrganization[msg.sender].valid, "You are not an organization");

    require(allOrganization[msg.sender].availablePoints - amount >= 0, "Insufficient Points");

    if (!allPersonal[awardee].valid) {
      allPersonal[awardee].totalCerts = 0;
      allPersonal[awardee].valid = true;
    }

    allOrganization[msg.sender].availablePoints -= amount;
    allPersonal[awardee].points += amount;

    emit PointAwarded(msg.sender, awardee, amount, reason, block.timestamp);
  }

  function withdraw() external onlyOwner {
    payable(owner()).transfer(address(this).balance);
  }
}

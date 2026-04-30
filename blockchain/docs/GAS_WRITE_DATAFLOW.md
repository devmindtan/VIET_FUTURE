# Dataflow Chữ Cho Các Hàm Ghi State Và Tốn Gas

Tài liệu này chỉ liệt kê các hàm trong thư mục `blockchain/contracts` có thể làm thay đổi state on-chain, cập nhật role, hoặc chuyển ETH khi giao dịch thành công.

Phạm vi lọc:

- Có ghi storage hoặc gọi logic dẫn tới ghi storage.
- Có thể tiêu tốn gas như một transaction state-changing.
- Loại trừ toàn bộ `view`, `pure`, getter, Reader contract, và các helper chỉ tính toán/kiểm tra.
- Không liệt kê constructor như một entrypoint nghiệp vụ, nhưng có ghi chú riêng ở cuối.

## 1. Tenant Governance

### `createTenant` - `VoucherProtocol.createTenant`

Dataflow:

1. `PROTOCOL_ADMIN_ROLE` gọi `VoucherProtocol.createTenant`.
2. Contract kiểm tra `tenantId`, `admin`, `operatorManager`, `treasury`, config stake/cooldown và bảo đảm tenant chưa tồn tại.
3. Ghi `_s.tenants[tenantId]` với `admin`, `operatorManager`, `treasury`, `isActive = true`, `createdAt = block.timestamp`.
4. Ghi `_s.tenantList.push(tenantId)` để tenant xuất hiện trong danh sách duyệt.
5. Tạo 2 dynamic role cho tenant: admin role và operator-manager role.
6. Gọi `_registerTenantRole` hai lần để ghi `tenantRoleToTenantId[role]` và `tenantRoleKinds[role]` trong `VoucherProtocolHelper`.
7. Gọi `_grantRole` để ghi membership của `config.admin` và `config.operatorManager` vào AccessControl storage.
8. Gọi `_setRoleAdmin` để ghi role-admin relationship cho hai role tenant.
9. Ghi `_s.tenantMinOperatorStake[tenantId]` và `_s.tenantUnstakeCooldown[tenantId]`.
10. Emit `TenantCreated`, `TenantStatusUpdated`, `MinOperatorStakeUpdated`, `UnstakeCooldownUpdated`.

Storage bị chạm:

- `_s.tenants`
- `_s.tenantList`
- `tenantRoleToTenantId`
- `tenantRoleKinds`
- AccessControl role storage
- `_s.tenantMinOperatorStake`
- `_s.tenantUnstakeCooldown`

### `setTenantStatus` - `VoucherProtocol.setTenantStatus`

Dataflow:

1. `PROTOCOL_ADMIN_ROLE` gọi `setTenantStatus`.
2. Contract kiểm tra tenant tồn tại.
3. Ghi `_s.tenants[tenantId].isActive = isActive`.
4. Emit `TenantStatusUpdated`.

Storage bị chạm:

- `_s.tenants[tenantId].isActive`

## 2. Operator Lifecycle

### `joinAsOperator` - `VoucherProtocol.joinAsOperator -> OperatorLib.joinAsOperator`

Dataflow:

1. Operator gửi transaction kèm `msg.value`.
2. `VoucherProtocol` delegate sang `OperatorLib.joinAsOperator`.
3. Library kiểm tra caller không phải protocol admin, tenant tồn tại và đang active, stake đủ lớn, operator chưa active.
4. Ghi `_s.operators[tenantId][msg.sender]` với `walletAddress`, `metadataURI`, `stakeAmount`, `isActive = true`.
5. Nếu operator chưa từng được list, ghi `_s.operatorList[tenantId].push(msg.sender)` và `_s.isOperatorListed[tenantId][msg.sender] = true`.
6. Ghi `_s.pendingUnstakeAt[tenantId][msg.sender] = 0`.
7. Emit `OperatorJoined` và `OperatorStatusUpdated`.

Storage bị chạm:

- `_s.operators`
- `_s.operatorList`
- `_s.isOperatorListed`
- `_s.pendingUnstakeAt`

### `topUpStake` - `VoucherProtocol.topUpStake -> OperatorLib.topUpStake`

Dataflow:

1. Operator đang active gửi thêm ETH vào `topUpStake`.
2. Library xác thực tenant tồn tại, tenant active, operator thuộc tenant, operator active, `msg.value > 0`.
3. Ghi cộng dồn `_s.operators[tenantId][msg.sender].stakeAmount += msg.value`.
4. Emit `OperatorStakeToppedUp`.

Storage bị chạm:

- `_s.operators[tenantId][msg.sender].stakeAmount`

### `updateOperatorMetadata` - `VoucherProtocol.updateOperatorMetadata -> OperatorLib.updateOperatorMetadata`

Dataflow:

1. Operator gọi cập nhật metadata.
2. Library xác thực tenant tồn tại, tenant active, operator active.
3. Ghi `_s.operators[tenantId][msg.sender].metadataURI = metadataURI`.
4. Emit `OperatorMetadataUpdated`.

Storage bị chạm:

- `_s.operators[tenantId][msg.sender].metadataURI`

### `requestUnstake` - `VoucherProtocol.requestUnstake -> OperatorLib.requestUnstake`

Dataflow:

1. Operator active gọi yêu cầu rút stake.
2. Library xác thực tenant tồn tại, tenant active, operator active, stake khác 0.
3. Tính `availableAt = block.timestamp + _s.tenantUnstakeCooldown[tenantId]`.
4. Ghi `_s.pendingUnstakeAt[tenantId][msg.sender] = availableAt`.
5. Emit `OperatorUnstakeRequested`.

Storage bị chạm:

- `_s.pendingUnstakeAt`

### `executeUnstake` - `VoucherProtocol.executeUnstake -> OperatorLib.executeUnstake`

Dataflow:

1. Operator gọi `executeUnstake` sau khi cooldown hoàn tất.
2. Library đọc `readyAt`, kiểm tra tenant active, có pending unstake, và đã tới thời điểm rút.
3. Lấy `amount = _s.operators[tenantId][msg.sender].stakeAmount`.
4. Ghi `_s.operators[tenantId][msg.sender].stakeAmount = 0`.
5. Ghi `_s.operators[tenantId][msg.sender].isActive = false`.
6. Ghi `_s.pendingUnstakeAt[tenantId][msg.sender] = 0`.
7. Chuyển ETH từ contract về `msg.sender` bằng low-level call.
8. Emit `OperatorUnstaked` và `OperatorStatusUpdated`.

Storage bị chạm:

- `_s.operators[tenantId][msg.sender].stakeAmount`
- `_s.operators[tenantId][msg.sender].isActive`
- `_s.pendingUnstakeAt`

Side effect khác:

- Chuyển ETH ra khỏi contract về operator.

### `setOperatorStatus` - `VoucherProtocol.setOperatorStatus -> OperatorLib.setOperatorStatus`

Dataflow:

1. Operator manager của tenant gọi hàm để bật/tắt operator.
2. Library xác thực tenant tồn tại, caller có operator-manager role, operator có stake.
3. Ghi `_s.operators[tenantId][operator].isActive = isActive`.
4. Nếu `isActive = false`, ghi `_s.pendingUnstakeAt[tenantId][operator] = 0` để hủy lịch rút stake cũ.
5. Emit `OperatorStatusUpdated`.

Storage bị chạm:

- `_s.operators[tenantId][operator].isActive`
- `_s.pendingUnstakeAt`

### `setTreasury` - `VoucherProtocol.setTreasury -> OperatorLib.setTreasury`

Dataflow:

1. Tenant admin gọi đổi treasury.
2. Library xác thực tenant tồn tại, caller có tenant-admin role, địa chỉ mới hợp lệ và không xung đột role governance.
3. Đọc `oldTreasury` từ `_s.tenants[tenantId].treasury`.
4. Ghi `_s.tenants[tenantId].treasury = newTreasury`.
5. Emit `TreasuryUpdated`.

Storage bị chạm:

- `_s.tenants[tenantId].treasury`

### `slashOperator` - `VoucherProtocol.slashOperator -> OperatorLib.slashOperator`

Dataflow:

1. Operator manager gọi hard slash.
2. Library xác thực tenant tồn tại, caller có quyền, operator có stake.
3. Đọc toàn bộ stake hiện tại thành `amount`.
4. Ghi `_s.operators[tenantId][operator].isActive = false`.
5. Ghi `_s.operators[tenantId][operator].stakeAmount = 0`.
6. Ghi `_s.pendingUnstakeAt[tenantId][operator] = 0`.
7. `delete _s.recoveryDelegates[tenantId][operator]`.
8. Chuyển `amount` ETH sang treasury của tenant.
9. Emit `OperatorSlashed` và `OperatorStatusUpdated`.

Storage bị chạm:

- `_s.operators[tenantId][operator].isActive`
- `_s.operators[tenantId][operator].stakeAmount`
- `_s.pendingUnstakeAt`
- `_s.recoveryDelegates`

Side effect khác:

- Chuyển ETH sang treasury.

### `softSlashOperator` - `VoucherProtocol.softSlashOperator -> OperatorLib.softSlashOperator`

Dataflow:

1. Operator manager gọi soft slash với `violationCode`.
2. Library cấm tự slash chính mình, kiểm tra tenant tồn tại, quyền hợp lệ, operator có stake và penalty đã cấu hình.
3. Tính `slashAmount` theo `penaltyBps`, luôn tối thiểu là 1 wei nếu phép chia ra 0.
4. Tính `remaining = stakeBefore - slashAmount`.
5. Ghi `_s.operators[tenantId][operator].stakeAmount = remaining`.
6. Ghi `_s.pendingUnstakeAt[tenantId][operator] = 0`.
7. Nếu `remaining < _s.tenantMinOperatorStake[tenantId]`, ghi `_s.operators[tenantId][operator].isActive = false` và `delete _s.recoveryDelegates[tenantId][operator]`.
8. Chuyển `slashAmount` ETH sang treasury.
9. Emit `OperatorSoftSlashed`, và có thể emit thêm `OperatorStatusUpdated` nếu bị tụt dưới min stake.

Storage bị chạm:

- `_s.operators[tenantId][operator].stakeAmount`
- `_s.pendingUnstakeAt`
- `_s.operators[tenantId][operator].isActive` khi bị dưới ngưỡng
- `_s.recoveryDelegates` khi bị dưới ngưỡng

Side effect khác:

- Chuyển ETH sang treasury.

### `setMinOperatorStake` - `VoucherProtocol.setMinOperatorStake -> OperatorLib.setMinOperatorStake`

Dataflow:

1. Operator manager gọi cập nhật stake tối thiểu của tenant.
2. Library xác thực tenant tồn tại, caller có quyền, giá trị mới khác 0.
3. Đọc giá trị cũ.
4. Ghi `_s.tenantMinOperatorStake[tenantId] = newMinOperatorStake`.
5. Emit `MinOperatorStakeUpdated`.

Storage bị chạm:

- `_s.tenantMinOperatorStake`

### `setUnstakeCooldown` - `VoucherProtocol.setUnstakeCooldown -> OperatorLib.setUnstakeCooldown`

Dataflow:

1. Operator manager gọi cập nhật cooldown.
2. Library xác thực tenant tồn tại, caller có quyền, giá trị mới khác 0.
3. Đọc giá trị cũ.
4. Ghi `_s.tenantUnstakeCooldown[tenantId] = newUnstakeCooldown`.
5. Emit `UnstakeCooldownUpdated`.

Storage bị chạm:

- `_s.tenantUnstakeCooldown`

### `setViolationPenalty` - `VoucherProtocol.setViolationPenalty -> OperatorLib.setViolationPenalty`

Dataflow:

1. Operator manager gọi cấu hình penalty theo `violationCode`.
2. Library xác thực tenant tồn tại, caller có quyền, `violationCode != 0`, `penaltyBps` nằm trong `(0, 10000]`.
3. Đọc `oldPenalty`.
4. Ghi `_s.tenantViolationPenalties[tenantId][violationCode] = penaltyBps`.
5. Emit `ViolationPenaltyUpdated`.

Storage bị chạm:

- `_s.tenantViolationPenalties`

## 3. Document Anchoring

### `registerWithSignature` - `VoucherProtocol.registerWithSignature -> DocumentLib.registerWithSignature`

Dataflow:

1. Bất kỳ relayer nào cũng có thể submit transaction chứa `payload` và chữ ký EIP-712.
2. Library kiểm tra tenant tồn tại, tenant active, chữ ký chưa hết hạn, document chưa tồn tại.
3. Recover signer từ typed-data và xác thực signer là operator active của tenant, nonce khớp, signer không phải protocol admin.
4. Ghi `_s.documents[payload.tenantId][payload.fileHash]` với toàn bộ snapshot tài liệu: CID, owner, issuer, timestamp, hashes mã hóa, `docType`, `version`, `isValid = true`.
5. Ghi `_s.documentSigners[payload.tenantId][payload.fileHash][signer] = true`.
6. Ghi `_s.coSignCount[payload.tenantId][payload.fileHash] = 1`.
7. Nếu policy co-sign của `docType` đang tắt, ghi `_s.coSignQualified[payload.tenantId][payload.fileHash] = true`.
8. Nếu policy đang bật và signer vừa whitelist vừa đủ stake, đọc `roleId`, rồi có thể ghi `_s.trustedCoSignCount = 1` và `_s.trustedCoSignRoleMask = roleMask`.
9. Trong nhánh trên, gọi helper `_evaluateCoSignQualification`, helper này có thể tiếp tục ghi `_s.coSignQualified = true` nếu đã đạt ngưỡng signer và role mask.
10. Ghi `_s.nonces[payload.tenantId][signer] = payload.nonce + 1`.
11. Emit `NonceConsumed`, `DocumentAnchored`, `DocumentCoSigned`.

Storage bị chạm:

- `_s.documents`
- `_s.documentSigners`
- `_s.coSignCount`
- `_s.coSignQualified`
- `_s.trustedCoSignCount`
- `_s.trustedCoSignRoleMask`
- `_s.nonces`

### `revokeDocument` - `VoucherProtocol.revokeDocument -> DocumentLib.revokeDocument`

Dataflow:

1. Tenant admin hoặc chính issuer gọi thu hồi tài liệu.
2. Library lấy document storage, kiểm tra document tồn tại, caller có quyền, document chưa revoke.
3. Ghi `doc.isValid = false`.
4. Emit `DocumentRevoked`.

Storage bị chạm:

- `_s.documents[tenantId][fileHash].isValid`

## 4. Co-Sign Governance Và Ký Bổ Sung

### `coSignDocumentWithSignature` - `VoucherProtocol.coSignDocumentWithSignature -> CoSignLib.coSignDocumentWithSignature`

Dataflow:

1. Relayer submit transaction chứa payload co-sign và chữ ký EIP-712.
2. Library kiểm tra tenant tồn tại, tenant active, chữ ký chưa hết hạn, document tồn tại và còn valid.
3. Recover signer, kiểm tra signer không phải protocol admin, signer là operator active, nonce khớp và chưa ký document này trước đó.
4. Đọc `policy = _s.tenantCoSignPolicies[tenantId][doc.docType]`.
5. Nếu policy bật, chạy `_enforceCoSignPolicy` để kiểm tra whitelist, stake tối thiểu, role hợp lệ và tính `roleMask`.
6. Ghi `_s.documentSigners[tenantId][fileHash][signer] = true`.
7. Tăng và ghi `_s.coSignCount[tenantId][fileHash]`.
8. Ghi `_s.nonces[tenantId][signer] = payload.nonce + 1`.
9. Nếu policy bật, tăng và ghi `_s.trustedCoSignCount[tenantId][fileHash]`, OR vào `_s.trustedCoSignRoleMask[tenantId][fileHash]`, rồi gọi `_evaluateCoSignQualification`.
10. Helper `_evaluateCoSignQualification` có thể ghi `_s.coSignQualified[tenantId][fileHash] = true` khi đã đủ `minSigners` và đủ `requiredRoleMask`.
11. Emit `NonceConsumed` và `DocumentCoSigned`, có thể emit thêm `DocumentCoSignQualified` nếu vừa đạt quorum.

Storage bị chạm:

- `_s.documentSigners`
- `_s.coSignCount`
- `_s.nonces`
- `_s.trustedCoSignCount`
- `_s.trustedCoSignRoleMask`
- `_s.coSignQualified`

### `setCoSignPolicy` - `VoucherProtocol.setCoSignPolicy -> CoSignLib.setCoSignPolicy`

Dataflow:

1. Operator manager của tenant gọi cấu hình policy theo `docType`.
2. Library kiểm tra tenant tồn tại, caller có quyền, và nếu `enabled = true` thì policy không được rỗng hoàn toàn.
3. Ghi `_s.tenantCoSignPolicies[tenantId][docType] = CoSignPolicy(...)`.
4. Emit `CoSignPolicyUpdated`.

Storage bị chạm:

- `_s.tenantCoSignPolicies`

### `setCoSignOperator` - `VoucherProtocol.setCoSignOperator -> CoSignLib.setCoSignOperator`

Dataflow:

1. Operator manager gọi whitelist hoặc remove whitelist cho một operator trên một `docType`.
2. Library kiểm tra tenant tồn tại, caller có quyền, địa chỉ operator hợp lệ.
3. Nếu `whitelisted = true`, kiểm tra operator không phải protocol admin và `roleId` nằm trong `[1, 256]`.
4. Nếu whitelist, ghi `_s.tenantCoSignRoles[tenantId][docType][operator] = roleId`.
5. Nếu bỏ whitelist, ghi `_s.tenantCoSignRoles[tenantId][docType][operator] = 0`.
6. Ghi `_s.tenantCoSignWhitelisted[tenantId][docType][operator] = whitelisted`.
7. Emit `CoSignOperatorConfigured`.

Storage bị chạm:

- `_s.tenantCoSignRoles`
- `_s.tenantCoSignWhitelisted`

## 5. Recovery

### `setRecoveryDelegate` - `VoucherProtocol.setRecoveryDelegate -> RecoveryLib.setRecoveryDelegate`

Dataflow:

1. Operator active gọi thiết lập delegate khôi phục.
2. Library kiểm tra tenant tồn tại, caller đang active, delegate khác `0`, khác chính caller, và không phải protocol admin.
3. Ghi `_s.recoveryDelegates[tenantId][msg.sender] = delegate`.
4. Emit `OperatorRecoveryDelegateUpdated`.

Storage bị chạm:

- `_s.recoveryDelegates`

### `recoverOperatorByDelegate` - `VoucherProtocol.recoverOperatorByDelegate -> RecoveryLib.recoverOperatorByDelegate`

Dataflow:

1. Delegate đã được đăng ký trước đó gọi recovery cho `lostOperator`.
2. Library kiểm tra tenant tồn tại, caller không phải protocol admin, `lostOperator` đang ở trạng thái lost, còn stake, không có unstake pending, delegate khớp, và ví mới `msg.sender` chưa là operator.
3. Đọc `oldData = _s.operators[tenantId][lostOperator]`.
4. Ghi `_s.operators[tenantId][msg.sender]` bằng bản sao dữ liệu cũ nhưng thay `walletAddress = msg.sender`.
5. Nếu ví mới chưa có trong list, ghi `_s.operatorList[tenantId].push(msg.sender)` và `_s.isOperatorListed[tenantId][msg.sender] = true`.
6. Ghi copy nonce: `_s.nonces[tenantId][msg.sender] = _s.nonces[tenantId][lostOperator]`.
7. Ghi `_s.pendingUnstakeAt[tenantId][msg.sender] = 0`.
8. Gọi `_linkRecoveryAlias` để ghi `_s.recoveredFrom[tenantId][msg.sender] = rootOperator` và `_s.recoveredTo[tenantId][lostOperator] = msg.sender`.
9. Xóa state cũ của ví bị mất: `delete _s.operators[tenantId][lostOperator]`, `delete _s.nonces[tenantId][lostOperator]`, `delete _s.pendingUnstakeAt[tenantId][lostOperator]`, `delete _s.recoveryDelegates[tenantId][lostOperator]`.
10. Emit `OperatorRecovered`, `OperatorRecoveryAliasUpdated`, `OperatorRecoveryDelegateUpdated`.

Storage bị chạm:

- `_s.operators`
- `_s.operatorList`
- `_s.isOperatorListed`
- `_s.nonces`
- `_s.pendingUnstakeAt`
- `_s.recoveredFrom`
- `_s.recoveredTo`
- `_s.recoveryDelegates`

### `recoverOperatorByAdmin` - `VoucherProtocol.recoverOperatorByAdmin -> RecoveryLib.recoverOperatorByAdmin`

Dataflow:

1. Operator manager gọi recovery cưỡng bức từ `lostOperator` sang `newOperator`.
2. Library kiểm tra tenant tồn tại, caller có quyền, `lostOperator` đang lost, `newOperator` hợp lệ, không phải protocol admin, và chưa có state operator.
3. Đọc `oldData = _s.operators[tenantId][lostOperator]`.
4. Ghi `_s.operators[tenantId][newOperator]` bằng dữ liệu cũ nhưng thay `walletAddress = newOperator`.
5. Nếu ví mới chưa có trong list, ghi `_s.operatorList[tenantId].push(newOperator)` và `_s.isOperatorListed[tenantId][newOperator] = true`.
6. Ghi copy nonce và reset pending unstake cho ví mới.
7. Gọi `_linkRecoveryAlias` để ghi `_s.recoveredFrom` và `_s.recoveredTo`.
8. Xóa state của `lostOperator`: operator record, nonce, pending unstake, recovery delegate.
9. Emit `OperatorRecovered`, `OperatorRecoveryAliasUpdated`, `OperatorRecoveryDelegateUpdated`.

Storage bị chạm:

- `_s.operators`
- `_s.operatorList`
- `_s.isOperatorListed`
- `_s.nonces`
- `_s.pendingUnstakeAt`
- `_s.recoveredFrom`
- `_s.recoveredTo`
- `_s.recoveryDelegates`

## 6. Role Management

### `grantRole` - `VoucherProtocol.grantRole`

Dataflow:

1. Caller có `getRoleAdmin(role)` gọi `grantRole`.
2. Override trong `VoucherProtocol` chạy `_enforceTenantRoleSegregationOnGrant` trước khi ghi role.
3. Helper kiểm tra role có thuộc tenant governance không; nếu có thì chặn protocol admin hoặc các xung đột admin/operatorManager/treasury trong cùng tenant.
4. Sau khi qua kiểm tra, contract gọi `_grantRole(role, account)` của AccessControl.
5. `_grantRole` ghi membership của `account` cho `role` vào storage của AccessControl và emit event tiêu chuẩn của OpenZeppelin nếu role chưa tồn tại trước đó.

Storage bị chạm:

- AccessControl role membership storage

## 7. Helper Nội Bộ Có Ghi State

Các helper dưới đây không phải entrypoint người dùng gọi trực tiếp, nhưng vẫn ghi state trong các file của thư mục này:

### `_registerTenantRole` - `VoucherProtocolHelper`

Dataflow:

1. Được gọi từ `createTenant`.
2. Ghi `tenantRoleToTenantId[role] = tenantId`.
3. Ghi `tenantRoleKinds[role] = roleKind`.

### `_evaluateCoSignQualification` - `DocumentLib`

Dataflow:

1. Được gọi trong `registerWithSignature` khi policy co-sign đang bật và signer đầu tiên đủ điều kiện trusted.
2. Nếu document chưa qualified, helper đọc policy và trạng thái trusted hiện tại.
3. Khi đủ `minSigners` và `requiredRoleMask`, ghi `_s.coSignQualified[tenantId][fileHash] = true`.
4. Emit `DocumentCoSignQualified`.

### `_evaluateCoSignQualification` - `CoSignLib`

Dataflow:

1. Được gọi trong `coSignDocumentWithSignature` sau khi trusted signer mới được cộng vào hệ thống.
2. Nếu document chưa qualified, helper đọc policy, trusted signer count, trusted role mask.
3. Khi thỏa quorum, ghi `_s.coSignQualified[tenantId][fileHash] = true`.
4. Emit `DocumentCoSignQualified`.

### `_linkRecoveryAlias` - `RecoveryLib`

Dataflow:

1. Được gọi trong cả hai flow recovery.
2. Xác định `rootOperator` của chuỗi recovery, nếu chưa có thì chính `oldOperator` là root.
3. Ghi `_s.recoveredFrom[tenantId][newOperator] = rootOperator`.
4. Ghi `_s.recoveredTo[tenantId][oldOperator] = newOperator`.

## 8. Các File Không Có Hàm Ghi State-Change Entry Point

- `VoucherProtocolReader.sol`: chỉ có `view`, không ghi state.
- `VoucherTypes.sol`: chỉ định nghĩa struct/storage layout.
- `IVoucherProtocolErrorsEvents.sol`: chỉ khai báo error/event/interface.

## 9. Ghi Chú Về Constructor

Constructor của `VoucherProtocol` vẫn ghi state khi deploy:

- `protocolOwner = msg.sender`
- cấp `DEFAULT_ADMIN_ROLE`
- cấp `PROTOCOL_ADMIN_ROLE`
- ghi `DOMAIN_SEPARATOR`
- emit `ProtocolInitialized`

Tuy nhiên tài liệu chính phía trên chỉ tập trung vào các hàm nghiệp vụ được gọi sau khi contract đã deploy.

import { useState } from "react";
import {
  Stack,
  Title,
  Group,
  Button,
  Table,
  Badge,
  Text,
  Modal,
  TextInput,
  Select,
  ActionIcon,
  Tooltip,
  Card,
  Tabs,
  NumberInput,
  Avatar,
} from "@mantine/core";
import {
  PlusIcon,
  ArrowClockwiseIcon,
  EyeIcon,
  CurrencyEthIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import type { OperatorStatus } from "../../utils/types";
import { shortAddress, shortBytes32 } from "../../utils/display";

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "teal",
  SLASHED: "red",
  UNSTAKING: "yellow",
  INACTIVE: "gray",
};

function JoinOperatorModal({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Tham gia làm Operator"
      size="md"
    >
      <Stack gap="md">
        <Select label="Tenant ID" placeholder="1" required />
        <TextInput
          label="Operator address"
          placeholder="0x..."
          ff="monospace"
          required
        />
        <TextInput label="Metadata URI" placeholder="ipfs://..." />
        <NumberInput label="Stake ban đầu (ETH)" placeholder="100" min={0} />
        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose}>
            Hủy
          </Button>
          <Button color="teal">Tham gia</Button>
        </Group>
      </Stack>
    </Modal>
  );
}

function OperatorDetailModal({
  op,
  opened,
  onClose,
  canManageOperators,
  canManageStake,
}: {
  op: OperatorStatus | null;
  opened: boolean;
  onClose: () => void;
  canManageOperators: boolean;
  canManageStake: boolean;
}) {
  if (!op) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Chi tiết Operator"
      size="lg"
    >
      <Tabs defaultValue="info">
        <Tabs.List mb="md">
          <Tabs.Tab value="info">Thông tin</Tabs.Tab>
          {canManageStake && <Tabs.Tab value="stake">Stake</Tabs.Tab>}
          {(canManageOperators || canManageStake) && (
            <Tabs.Tab value="actions">Hành động</Tabs.Tab>
          )}
        </Tabs.List>

        <Tabs.Panel value="info">
          <Stack gap="sm">
            {[
              ["Địa chỉ", shortAddress(op.walletAddress)],
              ["Trạng thái", op.isActive ? "ACTIVE" : "INACTIVE"],
              ["Stake", op.stakeAmount],
              ["Nonce", op.nonce.toString()],
              ["Recovery Delegate", shortAddress(op.recoveryDelegate)],
            ].map(([k, v]) => (
              <Group key={k} justify="space-between">
                <Text size="sm" c="dimmed">
                  {k}
                </Text>
                <Text
                  size="sm"
                  fw={500}
                  ff={k === "Địa chỉ" ? "monospace" : undefined}
                >
                  {v}
                </Text>
              </Group>
            ))}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="stake">
          <Stack gap="md" mt="xs">
            <Group justify="space-between">
              <Text size="sm">Stake hiện tại</Text>
              <Text fw={700}>{op.stakeAmount}</Text>
            </Group>
            <Text size="sm" c="dimmed">
              Tối thiểu stake phụ thuộc runtime config của tenant.
            </Text>
            <TextInput
              label="Nạp thêm stake (ETH)"
              placeholder="Nhập số ETH..."
            />
            <Button
              leftSection={<CurrencyEthIcon size={16} />}
              variant="light"
              color="teal"
            >
              Top up Stake
            </Button>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="actions">
          <Stack gap="sm" mt="xs">
            {canManageOperators && (
              <Button variant="light" color="teal" fullWidth>
                Kích hoạt
              </Button>
            )}
            {canManageStake && (
              <>
                <Button variant="light" color="yellow" fullWidth>
                  Yêu cầu Unstake
                </Button>
                <Button variant="light" color="blue" fullWidth>
                  Thực hiện Unstake
                </Button>
              </>
            )}
            {canManageOperators && (
              <Button
                variant="light"
                color="red"
                fullWidth
                leftSection={<WarningIcon size={16} />}
              >
                Thu hồi (Admin)
              </Button>
            )}
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
}

export function Operators({
  tenantId,
  operatorsData,
  canJoinOperator,
  canManageOperators,
  canManageStake,
}: {
  tenantId?: string;
  operatorsData: OperatorStatus[];
  canJoinOperator: boolean;
  canManageOperators: boolean;
  canManageStake: boolean;
}) {
  const [joinOpen, setJoinOpen] = useState(false);
  const [detail, setDetail] = useState<OperatorStatus | null>(null);

  const filtered = operatorsData;

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <Title order={3}>
          {tenantId
            ? `Operators · Tenant #${shortBytes32(tenantId)}`
            : "Quản lý Operators"}
        </Title>
        <Group gap="xs">
          <Tooltip label="Làm mới">
            <ActionIcon variant="default" size="lg">
              <ArrowClockwiseIcon size={16} />
            </ActionIcon>
          </Tooltip>
          {canJoinOperator && (
            <Button
              leftSection={<PlusIcon size={16} />}
              color="teal"
              onClick={() => setJoinOpen(true)}
            >
              Tham gia làm Operator
            </Button>
          )}
        </Group>
      </Group>

      <Card withBorder radius="md" padding={0}>
        <Table highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Địa chỉ</Table.Th>
              <Table.Th>Trạng thái</Table.Th>
              <Table.Th>Stake</Table.Th>
              <Table.Th>Nonce</Table.Th>
              <Table.Th>Unstake</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filtered.map((op) => (
              <Table.Tr key={op.walletAddress}>
                <Table.Td>
                  <Group gap="xs">
                    <Avatar size="sm" radius="xl" color="teal">
                      {op.walletAddress[2]}
                    </Avatar>
                    <Text size="sm" ff="monospace">
                      {shortAddress(op.walletAddress)}
                    </Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={STATUS_COLOR[op.isActive ? "ACTIVE" : "INACTIVE"]}
                    size="sm"
                    variant="light"
                  >
                    {op.isActive ? "ACTIVE" : "INACTIVE"}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{op.stakeAmount}</Text>
                </Table.Td>
                <Table.Td>{op.nonce.toString()}</Table.Td>
                <Table.Td>
                  {op.canUnstakeNow ? (
                    <Badge color="teal" size="xs">
                      Ready
                    </Badge>
                  ) : (
                    <Text size="xs" c="dimmed">
                      Pending
                    </Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <Tooltip label="Xem chi tiết">
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      onClick={() => setDetail(op)}
                    >
                      <EyeIcon size={14} />
                    </ActionIcon>
                  </Tooltip>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>

      <JoinOperatorModal opened={joinOpen} onClose={() => setJoinOpen(false)} />
      <OperatorDetailModal
        op={detail}
        opened={!!detail}
        onClose={() => setDetail(null)}
        canManageOperators={canManageOperators}
        canManageStake={canManageStake}
      />
    </Stack>
  );
}

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
  NumberInput,
  ActionIcon,
  Tooltip,
  Card,
  Tabs,
  Divider,
  Alert,
  Loader,
} from "@mantine/core";
import {
  ArrowClockwiseIcon,
  LightningIcon,
  WarningCircleIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { shortBytes32 } from "../../utils/display";

interface ViolationPenalty {
  tenant_id: string;
  violation_type: string;
  penalty_amount: string;
  is_hard: boolean;
}

interface SlashHistoryEntry {
  operator: string;
  tenant_id: string;
  violation_type: string;
  reason: string;
  amount: string;
  timestamp: string;
}

function SlashModal({
  opened,
  onClose,
  isSoft,
}: {
  opened: boolean;
  onClose: () => void;
  isSoft: boolean;
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isSoft ? "Soft Slash Operator" : "Hard Slash Operator"}
      size="md"
    >
      <Stack gap="md">
        {!isSoft && (
          <Alert color="red" icon={<WarningCircleIcon size={16} />}>
            Hard slash sẽ loại bỏ operator vĩnh viễn và tịch thu toàn bộ stake!
          </Alert>
        )}
        <TextInput label="Tenant ID" placeholder="1" required />
        <TextInput
          label="Operator address"
          placeholder="0x..."
          ff="monospace"
          required
        />
        <Select
          label="Loại vi phạm"
          data={["DATA_FRAUD", "LATE_COSIGN", "DOUBLE_SIGN"]}
          required
        />
        <Divider />
        {!isSoft && <NumberInput label="Số tiền tịch thu (ETH)" min={0} />}
        <TextInput label="Lý do (ghi chú)" placeholder="Mô tả vi phạm..." />
        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose}>
            Hủy
          </Button>
          <Button
            color={isSoft ? "orange" : "red"}
            leftSection={<LightningIcon size={16} />}
          >
            {isSoft ? "Soft Slash" : "Hard Slash"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

function SetPenaltyModal({
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
      title="Cập nhật Violation Penalty"
      size="md"
    >
      <Stack gap="md">
        <TextInput label="Tenant ID" placeholder="1" required />
        <Select
          label="Loại vi phạm"
          data={["DATA_FRAUD", "LATE_COSIGN", "DOUBLE_SIGN"]}
          required
        />
        <NumberInput label="Mức phạt (ETH)" min={0} step={1} />
        <Select
          label="Kiểu phạt"
          data={[
            { value: "hard", label: "Hard (loại bỏ hoàn toàn)" },
            { value: "soft", label: "Soft (cảnh cáo)" },
          ]}
        />
        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose}>
            Hủy
          </Button>
          <Button color="teal">Lưu</Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export function SlashPanel({
  tenantId,
  canSlashOperator,
  canEditPenalty,
}: {
  tenantId?: string;
  canSlashOperator: boolean;
  canEditPenalty: boolean;
}) {
  const [hardOpen, setHardOpen] = useState(false);
  const [softOpen, setSoftOpen] = useState(false);
  const [penaltyOpen, setPenaltyOpen] = useState(false);
  const [penalties] = useState<ViolationPenalty[]>([]);
  const historyRows: SlashHistoryEntry[] = [];
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <Title order={3}>
          {tenantId
            ? `Penalty & Slash · Tenant #${shortBytes32(tenantId)}`
            : "Xử phạt & Vi phạm"}
        </Title>
        <Group gap="xs">
          <Tooltip label="Làm mới">
            <ActionIcon variant="default" size="lg">
              <ArrowClockwiseIcon size={16} />
            </ActionIcon>
          </Tooltip>
          {canSlashOperator && (
            <>
              <Button
                variant="default"
                color="orange"
                leftSection={<LightningIcon size={16} />}
                onClick={() => setSoftOpen(true)}
              >
                Soft Slash
              </Button>
              <Button
                color="red"
                leftSection={<LightningIcon size={16} />}
                onClick={() => setHardOpen(true)}
              >
                Hard Slash
              </Button>
            </>
          )}
        </Group>
      </Group>

      <Tabs defaultValue="history">
        <Tabs.List mb="md">
          <Tabs.Tab value="history">Lịch sử xử phạt</Tabs.Tab>
          <Tabs.Tab value="penalties">Violation Penalties</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="history">
          <Card withBorder radius="md" padding={0}>
            <Table highlightOnHover verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Operator</Table.Th>
                  <Table.Th>Tenant</Table.Th>
                  <Table.Th>Loại</Table.Th>
                  <Table.Th>Lý do</Table.Th>
                  <Table.Th>Số tiền</Table.Th>
                  <Table.Th>Thời gian</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {historyRows.map((row) => (
                  <Table.Tr key={`${row.operator}-${row.timestamp}`}>
                    <Table.Td>{row.operator}</Table.Td>
                    <Table.Td>#{shortBytes32(row.tenant_id)}</Table.Td>
                    <Table.Td>
                      <Badge size="sm" variant="outline">
                        {row.violation_type}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{row.reason}</Table.Td>
                    <Table.Td>{row.amount}</Table.Td>
                    <Table.Td>{row.timestamp}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="penalties">
          {error ? (
            <Alert color="red" variant="light" mb="sm">
              {error}
            </Alert>
          ) : null}
          {loading ? <Loader size="sm" mb="sm" /> : null}
          <Group justify="flex-end" mb="sm">
            {canEditPenalty && (
              <Button
                size="xs"
                variant="default"
                leftSection={<PlusIcon size={13} />}
                onClick={() => setPenaltyOpen(true)}
              >
                Thêm / cập nhật penalty
              </Button>
            )}
          </Group>
          <Card withBorder radius="md" padding={0}>
            <Table highlightOnHover verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Tenant</Table.Th>
                  <Table.Th>Loại vi phạm</Table.Th>
                  <Table.Th>Mức phạt</Table.Th>
                  <Table.Th>Kiểu</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {penalties.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={4}>
                      <Text ta="center" c="dimmed" py="md">
                        Không có penalty để hiển thị.
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ) : null}
                {penalties.map((p, i) => (
                  <Table.Tr key={i}>
                    <Table.Td>#{shortBytes32(p.tenant_id)}</Table.Td>
                    <Table.Td>
                      <Badge size="sm" variant="outline">
                        {p.violation_type}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={600}>
                        {p.penalty_amount}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={p.is_hard ? "red" : "orange"}
                        size="sm"
                        variant="light"
                      >
                        {p.is_hard ? "HARD" : "SOFT"}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        </Tabs.Panel>
      </Tabs>

      {canSlashOperator && (
        <>
          <SlashModal
            opened={hardOpen}
            onClose={() => setHardOpen(false)}
            isSoft={false}
          />
          <SlashModal
            opened={softOpen}
            onClose={() => setSoftOpen(false)}
            isSoft={true}
          />
        </>
      )}
      {canEditPenalty && (
        <SetPenaltyModal
          opened={penaltyOpen}
          onClose={() => setPenaltyOpen(false)}
        />
      )}
    </Stack>
  );
}

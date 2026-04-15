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
  Divider,
  Switch,
  Alert,
  Loader,
} from "@mantine/core";
import {
  PlusIcon,
  ArrowClockwiseIcon,
  PencilSimpleIcon,
} from "@phosphor-icons/react";
import { shortBytes32, shortValue } from "../../utils/display";

interface CoSignPolicy {
  tenant_id: string;
  doc_type: string;
  enabled: boolean;
  min_stake: string;
  min_cosign: number;
  required_role_mask: string;
}

function PolicyModal({
  opened,
  onClose,
  policy,
}: {
  opened: boolean;
  onClose: () => void;
  policy?: CoSignPolicy;
}) {
  const isEdit = !!policy;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEdit ? "Chỉnh sửa Policy" : "Tạo Policy mới"}
      size="md"
    >
      <Stack gap="md">
        <TextInput
          label="Tenant ID"
          placeholder="1"
          defaultValue={policy?.tenant_id}
          required
          disabled={isEdit}
        />
        <Select
          label="Loại tài liệu"
          placeholder="Chọn loại..."
          defaultValue={policy?.doc_type}
          data={["VOUCHER", "INVOICE", "CONTRACT"]}
          required
          disabled={isEdit}
        />
        <NumberInput
          label="Số CoSign tối thiểu"
          defaultValue={policy?.min_cosign ?? 2}
          min={1}
          max={10}
        />
        <Divider label="Operator cụ thể (tuỳ chọn)" />
        <TextInput
          label="Required Role Mask"
          placeholder="0"
          defaultValue={policy?.required_role_mask ?? "0"}
          ff="monospace"
          disabled
        />
        <Switch
          label="Policy đang bật"
          defaultChecked={policy?.enabled ?? true}
        />
        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose}>
            Hủy
          </Button>
          <Button color="teal">{isEdit ? "Lưu thay đổi" : "Tạo Policy"}</Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export function CoSignPolicy({
  tenantId,
  canEdit,
}: {
  tenantId?: string;
  canEdit: boolean;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CoSignPolicy | null>(null);
  const [rows] = useState<CoSignPolicy[]>([]);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <Title order={3}>
          {tenantId
            ? `CoSign Policy · Tenant #${shortBytes32(tenantId)}`
            : "CoSign Policy"}
        </Title>
        <Group gap="xs">
          <Tooltip label="Làm mới">
            <ActionIcon variant="default" size="lg">
              <ArrowClockwiseIcon size={16} />
            </ActionIcon>
          </Tooltip>
          {canEdit && (
            <Button
              leftSection={<PlusIcon size={16} />}
              color="teal"
              onClick={() => setCreateOpen(true)}
            >
              Tạo Policy
            </Button>
          )}
        </Group>
      </Group>

      {error ? (
        <Alert color="red" variant="light">
          {error}
        </Alert>
      ) : null}

      {loading ? <Loader size="sm" /> : null}

      <Card withBorder radius="md" padding={0}>
        <Table highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Tenant</Table.Th>
              <Table.Th>Loại tài liệu</Table.Th>
              <Table.Th>Enabled</Table.Th>
              <Table.Th>Min Stake</Table.Th>
              <Table.Th>Min CoSign</Table.Th>
              <Table.Th>Role Mask</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={7}>
                  <Text ta="center" c="dimmed" py="md">
                    Không có CoSign policy để hiển thị.
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : null}
            {rows.map((p) => (
              <Table.Tr key={`${p.tenant_id}-${p.doc_type}`}>
                <Table.Td>#{shortBytes32(p.tenant_id)}</Table.Td>
                <Table.Td>
                  <Badge size="sm" variant="outline">
                    {p.doc_type}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={p.enabled ? "teal" : "gray"}
                    size="sm"
                    variant="light"
                  >
                    {p.enabled ? "Có" : "Không"}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{p.min_stake}</Text>
                </Table.Td>
                <Table.Td>
                  <Text fw={600}>{p.min_cosign}x</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" ff="monospace" c="dimmed">
                    {shortValue(p.required_role_mask, 12, 8)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  {canEdit && (
                    <Tooltip label="Chỉnh sửa">
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        onClick={() => setEditTarget(p)}
                      >
                        <PencilSimpleIcon size={14} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>

      {canEdit && (
        <PolicyModal opened={createOpen} onClose={() => setCreateOpen(false)} />
      )}
      {canEdit && (
        <PolicyModal
          opened={!!editTarget}
          onClose={() => setEditTarget(null)}
          policy={editTarget ?? undefined}
        />
      )}
    </Stack>
  );
}

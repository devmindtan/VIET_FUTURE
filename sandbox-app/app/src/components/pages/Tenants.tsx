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
} from "@mantine/core";
import {
  PlusIcon,
  ArrowClockwiseIcon,
  EyeIcon,
  PencilSimpleIcon,
} from "@phosphor-icons/react";
import type { TenantInfo } from "../../utils/types";
import { shortAddress, shortBytes32 } from "../../utils/display";

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "teal",
  SUSPENDED: "red",
  PENDING: "yellow",
};

function CreateTenantModal({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  return (
    <Modal opened={opened} onClose={onClose} title="Tạo Tenant mới" size="md">
      <Stack gap="md">
        <TextInput
          label="Tên Tenant"
          placeholder="Nhập tên tenant..."
          required
        />
        <TextInput
          label="Admin address"
          placeholder="0x..."
          ff="monospace"
          required
        />
        <TextInput
          label="Minimum Operator Stake (ETH)"
          placeholder="100"
          type="number"
        />
        <TextInput
          label="Cooldown Unstake (giây)"
          placeholder="604800"
          type="number"
        />
        <Select
          label="Trạng thái ban đầu"
          defaultValue="ACTIVE"
          data={["ACTIVE", "SUSPENDED"]}
        />
        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose}>
            Hủy
          </Button>
          <Button color="teal">Tạo Tenant</Button>
        </Group>
      </Stack>
    </Modal>
  );
}

function TenantDetailModal({
  tenant,
  opened,
  onClose,
  canEditTenantConfig,
  canSetTenantStatus,
}: {
  tenant: TenantInfo | null;
  opened: boolean;
  onClose: () => void;
  canEditTenantConfig: boolean;
  canSetTenantStatus: boolean;
}) {
  if (!tenant) return null;
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Chi tiết Tenant: ${shortBytes32(tenant.id)}`}
      size="lg"
    >
      <Tabs defaultValue="info">
        <Tabs.List mb="md">
          <Tabs.Tab value="info">Thông tin</Tabs.Tab>
          {canEditTenantConfig && (
            <Tabs.Tab value="config">Runtime Config</Tabs.Tab>
          )}
          {canSetTenantStatus && <Tabs.Tab value="actions">Hành động</Tabs.Tab>}
        </Tabs.List>

        <Tabs.Panel value="info">
          <Stack gap="sm">
            {[
              ["Tenant ID", shortBytes32(tenant.id)],
              ["Tên", shortBytes32(tenant.id)],
              ["Trạng thái", tenant.isActive ? "ACTIVE" : "SUSPENDED"],
              ["Admin", shortAddress(tenant.admin)],
              ["Operator Manager", shortAddress(tenant.operatorManager)],
              ["Treasury", shortAddress(tenant.treasury)],
              [
                "Ngày tạo",
                new Date(Number(tenant.createdAt) * 1000).toLocaleString(),
              ],
            ].map(([k, v]) => (
              <Group key={k} justify="space-between">
                <Text size="sm" c="dimmed">
                  {k}
                </Text>
                <Text size="sm" fw={500} ff="monospace">
                  {v}
                </Text>
              </Group>
            ))}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="config">
          <Stack gap="sm">
            <TextInput
              label="Min Operator Stake"
              defaultValue="100"
              rightSection={<Text size="xs">ETH</Text>}
            />
            <TextInput
              label="Unstake Cooldown"
              defaultValue="604800"
              rightSection={<Text size="xs">s</Text>}
            />
            <Group justify="flex-end" mt="sm">
              <Button size="sm">Lưu thay đổi</Button>
            </Group>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="actions">
          <Stack gap="sm" mt="xs">
            <Button variant="light" color="teal" fullWidth>
              Kích hoạt Tenant
            </Button>
            <Button variant="light" color="red" fullWidth>
              Tạm dừng Tenant
            </Button>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
}

export function Tenants({
  tenantId,
  tenants,
  canCreateTenant,
  canEditTenantConfig,
  canSetTenantStatus,
}: {
  tenantId?: string;
  tenants: TenantInfo[];
  canCreateTenant: boolean;
  canEditTenantConfig: boolean;
  canSetTenantStatus: boolean;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [detail, setDetail] = useState<TenantInfo | null>(null);
  const rows = tenantId
    ? tenants.filter((tenant) => tenant.id === tenantId)
    : tenants;

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <Title order={3}>
          {tenantId ? `Tenant #${shortBytes32(tenantId)}` : "Quản lý Tenants"}
        </Title>
        <Group gap="xs">
          <Tooltip label="Làm mới">
            <ActionIcon variant="default" size="lg">
              <ArrowClockwiseIcon size={16} />
            </ActionIcon>
          </Tooltip>
          {canCreateTenant && (
            <Button
              leftSection={<PlusIcon size={16} />}
              color="teal"
              onClick={() => setCreateOpen(true)}
            >
              Tạo Tenant
            </Button>
          )}
        </Group>
      </Group>

      <Card withBorder radius="md" padding={0}>
        <Table highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>Tên</Table.Th>
              <Table.Th>Trạng thái</Table.Th>
              <Table.Th>Operators</Table.Th>
              <Table.Th>Tài liệu</Table.Th>
              <Table.Th>Min Stake</Table.Th>
              <Table.Th>Ngày tạo</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((t) => (
              <Table.Tr key={t.id}>
                <Table.Td>
                  <Text size="sm" ff="monospace" c="dimmed">
                    #{shortBytes32(t.id)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" fw={600} ff="monospace">
                    {shortBytes32(t.id)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={STATUS_COLOR[t.isActive ? "ACTIVE" : "SUSPENDED"]}
                    size="sm"
                    variant="light"
                  >
                    {t.isActive ? "ACTIVE" : "SUSPENDED"}
                  </Badge>
                </Table.Td>
                <Table.Td>—</Table.Td>
                <Table.Td>—</Table.Td>
                <Table.Td>—</Table.Td>
                <Table.Td>
                  <Text size="xs" c="dimmed">
                    {new Date(Number(t.createdAt) * 1000).toLocaleDateString()}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    <Tooltip label="Xem chi tiết">
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        onClick={() => setDetail(t)}
                      >
                        <EyeIcon size={14} />
                      </ActionIcon>
                    </Tooltip>
                    {canEditTenantConfig && (
                      <Tooltip label="Chỉnh sửa">
                        <ActionIcon size="sm" variant="subtle">
                          <PencilSimpleIcon size={14} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>

      <CreateTenantModal
        opened={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      <TenantDetailModal
        tenant={detail}
        opened={!!detail}
        onClose={() => setDetail(null)}
        canEditTenantConfig={canEditTenantConfig}
        canSetTenantStatus={canSetTenantStatus}
      />
    </Stack>
  );
}

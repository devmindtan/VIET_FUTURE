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
  Textarea,
  Divider,
  Code,
  Loader,
} from "@mantine/core";
import {
  PlusIcon,
  ArrowClockwiseIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  SealCheckIcon,
} from "@phosphor-icons/react";
import { shortBytes32, shortValue } from "../../utils/display";

interface DocRecord {
  id: string;
  cid: string;
  file_hash: string;
  tenant_id: string;
  doc_type: string;
  status: string;
  cosign_count: number;
  cosign_required: number;
  registered_at: string;
}

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "teal",
  PENDING_COSIGN: "yellow",
  REVOKED: "red",
};

function RegisterModal({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  return (
    <Modal opened={opened} onClose={onClose} title="Đăng ký tài liệu" size="lg">
      <Stack gap="md">
        <TextInput label="Tenant ID" placeholder="1" required />
        <Select
          label="Loại tài liệu"
          placeholder="Chọn loại..."
          data={["VOUCHER", "INVOICE", "CONTRACT"]}
          required
        />
        <TextInput
          label="Document CID (IPFS)"
          placeholder="Qm..."
          ff="monospace"
          required
        />
        <TextInput
          label="Document Hash (sha256)"
          placeholder="0x..."
          ff="monospace"
          required
        />
        <Divider label="Chữ ký" />
        <Textarea
          label="Payload JSON"
          placeholder='{"nonce": "...", "deadline": "..."}'
          minRows={3}
          ff="monospace"
        />
        <TextInput
          label="Chữ ký (v, r, s)"
          placeholder="0x..."
          ff="monospace"
        />
        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose}>
            Hủy
          </Button>
          <Button color="teal">Đăng ký</Button>
        </Group>
      </Stack>
    </Modal>
  );
}

function VerifyModal({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  const [fileHash, setFileHash] = useState("");
  const [loading] = useState(false);
  const [result] = useState<null | {
    exists: boolean;
    isValid: boolean;
  }>(null);
  const [error] = useState<string | null>(null);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Xác thực tài liệu"
      size="md"
    >
      <Stack gap="md">
        <TextInput label="Document CID" placeholder="Qm..." ff="monospace" />
        <TextInput
          label="Document Hash"
          placeholder="0x..."
          ff="monospace"
          value={fileHash}
          onChange={(event) => setFileHash(event.currentTarget.value)}
        />
        {error ? (
          <Text size="sm" c="red">
            {error}
          </Text>
        ) : null}
        <Button loading={loading}>Xác thực</Button>
        {loading ? <Loader size="sm" /> : null}
        {result !== null && (
          <Group
            gap="xs"
            p="sm"
            style={{
              background:
                result.exists && result.isValid ? "#d3f9d8" : "#ffe3e3",
              borderRadius: 8,
            }}
          >
            {result.exists && result.isValid ? (
              <CheckCircleIcon size={20} color="green" />
            ) : (
              <XCircleIcon size={20} color="red" />
            )}
            <Text fw={600} c={result.exists && result.isValid ? "teal" : "red"}>
              {result.exists && result.isValid
                ? "Hợp lệ"
                : "Không hợp lệ hoặc đã bị thu hồi"}
            </Text>
          </Group>
        )}
      </Stack>
    </Modal>
  );
}

function DocDetailModal({
  doc,
  opened,
  onClose,
  canCoSignDocument,
  canRevokeDocument,
}: {
  doc: DocRecord | null;
  opened: boolean;
  onClose: () => void;
  canCoSignDocument: boolean;
  canRevokeDocument: boolean;
}) {
  if (!doc) return null;
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Chi tiết tài liệu"
      size="lg"
    >
      <Tabs defaultValue="info">
        <Tabs.List mb="md">
          <Tabs.Tab value="info">Thông tin</Tabs.Tab>
          <Tabs.Tab value="cosign">CoSign</Tabs.Tab>
          {(canCoSignDocument || canRevokeDocument) && (
            <Tabs.Tab value="actions">Hành động</Tabs.Tab>
          )}
        </Tabs.List>

        <Tabs.Panel value="info">
          <Stack gap="sm">
            {[
              ["CID", doc.cid],
              ["Tenant ID", doc.tenant_id],
              ["Loại tài liệu", doc.doc_type],
              ["Trạng thái", doc.status],
              ["Ngày đăng ký", doc.registered_at],
            ].map(([k, v]) => (
              <Group key={k} justify="space-between">
                <Text size="sm" c="dimmed">
                  {k}
                </Text>
                <Code>{v}</Code>
              </Group>
            ))}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="cosign">
          <Stack gap="sm">
            <Group justify="space-between">
              <Text size="sm">Tiến độ CoSign</Text>
              <Badge>
                {doc.cosign_count}/{doc.cosign_required}
              </Badge>
            </Group>
            <Stack gap="xs">
              {Array.from({ length: doc.cosign_count }).map((_, i) => (
                <Group key={i} gap="xs">
                  <CheckCircleIcon size={16} color="teal" weight="fill" />
                  <Text size="sm" ff="monospace" c="dimmed">
                    0xOperator{i + 1}…
                  </Text>
                </Group>
              ))}
              {Array.from({
                length: doc.cosign_required - doc.cosign_count,
              }).map((_, i) => (
                <Group key={`p${i}`} gap="xs">
                  <XCircleIcon size={16} color="gray" />
                  <Text size="sm" c="dimmed">
                    Chờ operator...
                  </Text>
                </Group>
              ))}
            </Stack>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="actions">
          <Stack gap="sm" mt="xs">
            {canCoSignDocument && (
              <Button
                leftSection={<SealCheckIcon size={16} />}
                variant="light"
                color="blue"
                fullWidth
              >
                CoSign (với chữ ký)
              </Button>
            )}
            {canRevokeDocument && (
              <Button variant="light" color="red" fullWidth>
                Thu hồi tài liệu
              </Button>
            )}
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
}

export function Documents({
  tenantId,
  canRegisterDocument,
  canVerifyDocument,
  canCoSignDocument,
  canRevokeDocument,
}: {
  tenantId?: string;
  canRegisterDocument: boolean;
  canVerifyDocument: boolean;
  canCoSignDocument: boolean;
  canRevokeDocument: boolean;
}) {
  const [registerOpen, setRegisterOpen] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [detail, setDetail] = useState<DocRecord | null>(null);
  const rows: DocRecord[] = [];

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <Title order={3}>
          {tenantId
            ? `Tài liệu · Tenant #${shortBytes32(tenantId)}`
            : "Quản lý Tài liệu"}
        </Title>
        <Group gap="xs">
          <Tooltip label="Làm mới">
            <ActionIcon variant="default" size="lg">
              <ArrowClockwiseIcon size={16} />
            </ActionIcon>
          </Tooltip>
          {canVerifyDocument && (
            <Button
              variant="default"
              leftSection={<CheckCircleIcon size={16} />}
              onClick={() => setVerifyOpen(true)}
            >
              Xác thực
            </Button>
          )}
          {canRegisterDocument && (
            <Button
              leftSection={<PlusIcon size={16} />}
              color="teal"
              onClick={() => setRegisterOpen(true)}
            >
              Đăng ký tài liệu
            </Button>
          )}
        </Group>
      </Group>

      <Card withBorder radius="md" padding={0}>
        <Table highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>CID</Table.Th>
              <Table.Th>Tenant</Table.Th>
              <Table.Th>Loại</Table.Th>
              <Table.Th>Trạng thái</Table.Th>
              <Table.Th>CoSign</Table.Th>
              <Table.Th>Ngày đăng ký</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={7}>
                  <Text ta="center" c="dimmed" py="md">
                    Chưa có dữ liệu document để hiển thị.
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : null}
            {rows.map((doc) => (
              <Table.Tr key={doc.cid}>
                <Table.Td>
                  <Text size="sm" ff="monospace">
                    {shortValue(doc.cid, 10, 8)}
                  </Text>
                </Table.Td>
                <Table.Td>#{shortBytes32(doc.tenant_id)}</Table.Td>
                <Table.Td>
                  <Badge size="sm" variant="outline">
                    {doc.doc_type}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={STATUS_COLOR[doc.status]}
                    size="sm"
                    variant="light"
                  >
                    {doc.status}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {doc.cosign_count}/{doc.cosign_required}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="xs" c="dimmed">
                    {doc.registered_at}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Tooltip label="Xem chi tiết">
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      onClick={() => setDetail(doc)}
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

      <RegisterModal
        opened={registerOpen}
        onClose={() => setRegisterOpen(false)}
      />
      <VerifyModal opened={verifyOpen} onClose={() => setVerifyOpen(false)} />
      <DocDetailModal
        doc={detail}
        opened={!!detail}
        onClose={() => setDetail(null)}
        canCoSignDocument={canCoSignDocument}
        canRevokeDocument={canRevokeDocument}
      />
    </Stack>
  );
}

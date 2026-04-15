import {
  Grid,
  Card,
  Text,
  Group,
  Stack,
  Badge,
  Table,
  Title,
  ThemeIcon,
  SimpleGrid,
} from "@mantine/core";
import {
  BuildingsIcon,
  UsersThreeIcon,
  FileTextIcon,
  SealCheckIcon,
} from "@phosphor-icons/react";
import { WalletSession } from "../access";
import type { TenantInfo, OperatorStatus } from "../../utils/types";
import { shortAddress, shortBytes32 } from "../../utils/display";
import { useState, useEffect } from "react";
interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  sub?: string;
}
import { fetchDocumentAnchoreds } from "../../services/blockchain.query.service";

function StatCard({ label, value, icon, color, sub }: StatCardProps) {
  return (
    <Card withBorder radius="md" padding="lg">
      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Text size="sm" c="dimmed">
            {label}
          </Text>
          <Text fw={700} size="xl">
            {value}
          </Text>
          {sub && (
            <Text size="xs" c="dimmed">
              {sub}
            </Text>
          )}
        </Stack>
        <ThemeIcon size="xl" radius="md" color={color} variant="light">
          {icon}
        </ThemeIcon>
      </Group>
    </Card>
  );
}

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "teal",
  REVOKED: "red",
  PENDING: "yellow",
};

export function Dashboard({
  session,
  tenants,
  operators,
  balanceEth,
  networkName,
}: {
  session: WalletSession;
  tenants: TenantInfo[];
  operators: OperatorStatus[];
  balanceEth: string;
  networkName: string;
}) {
  const [documentAnchoreds, setDocumentAnchoreds] = useState<any[]>([]);
  useEffect(() => {
    const handleFetchDocumentAnchoreds = async () => {
      try {
        console.log("🚀 Đang gọi API test...");
        const data = await fetchDocumentAnchoreds();

        console.log("✅ Dữ liệu lưu vào state:", data?.data);
        setDocumentAnchoreds(data?.data);
      } catch (error) {
        console.error("Lỗi fetch:", error);
      }
    };

    handleFetchDocumentAnchoreds();
  }, []);

  const title =
    session.primaryRole === "owner"
      ? "Tổng quan hệ thống"
      : session.primaryRole === "operator"
        ? "Bảng điều khiển Operator"
        : `Bảng điều khiển Tenant #${shortBytes32(session.tenantId)}`;

  return (
    <Stack gap="xl">
      <Title order={3}>{title}</Title>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
        <StatCard
          label={
            session.primaryRole === "owner" ? "Tổng Tenants" : "Tenant scope"
          }
          value={
            session.primaryRole === "owner"
              ? String(tenants.length)
              : `#${shortBytes32(session.tenantId)}`
          }
          icon={<BuildingsIcon size={22} />}
          color="blue"
          sub={
            session.primaryRole === "owner"
              ? "3 đang hoạt động"
              : getRoleSub(session)
          }
        />
        <StatCard
          label="Tổng Operators"
          value={String(operators.length)}
          icon={<UsersThreeIcon size={22} />}
          color="teal"
          sub="Dữ liệu từ SDK reader"
        />
        <StatCard
          label="Số dư ví"
          value={balanceEth}
          icon={<FileTextIcon size={22} />}
          color="violet"
          sub="ETH"
        />
        <StatCard
          label="Mạng kết nối"
          value={networkName}
          icon={<SealCheckIcon size={22} />}
          color="orange"
          sub="RPC hiện tại"
        />
      </SimpleGrid>

      <Grid>
        {/* Recent documents */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card withBorder radius="md" padding="md">
            <Text fw={600} mb="md">
              Tài liệu gần đây
            </Text>
            <Table highlightOnHover verticalSpacing="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Document ID</Table.Th>
                  <Table.Th>Tenant</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>CoSign</Table.Th>
                  <Table.Th>Thời gian</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {documentAnchoreds?.map((doc: any) => (
                  <Table.Tr key={doc.id}>
                    <Table.Td>
                      <Text size="sm" ff="monospace">
                        {doc.id.substring(0, 10)}...
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      {(doc.tenantId || doc.tenant).substring(0, 10)}...
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={STATUS_COLOR[doc.status] || "gray"}
                        size="sm"
                        variant="light"
                      >
                        {doc.status}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{doc.cosigned || 0}/3</Table.Td>
                    <Table.Td>
                      <Text size="xs" c="dimmed">
                        {/* Convert timestamp từ Graph (giây) sang ngày tháng */}
                        {new Date(
                          Number(doc.blockTimestamp) * 1000,
                        ).toLocaleString()}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}

                {/* Xử lý trường hợp mảng rỗng */}
                {documentAnchoreds?.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={5} align="center" py="xl">
                      <Text size="sm" c="dimmed">
                        Chưa tìm thấy tài liệu nào được ghi nhận trên Graph.
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Card>
        </Grid.Col>

        {/* Network status */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder radius="md" padding="md" h="100%">
            <Text fw={600} mb="md">
              Trạng thái mạng
            </Text>
            <Stack gap="sm">
              {[
                { label: "Network", value: networkName },
                { label: "Địa chỉ ví", value: shortAddress(session.address) },
                { label: "Vai trò", value: getRoleSub(session) },
                { label: "Tenant loaded", value: String(tenants.length) },
                { label: "Operator loaded", value: String(operators.length) },
              ].map(({ label, value }) => (
                <Group key={label} justify="space-between">
                  <Text size="sm" c="dimmed">
                    {label}
                  </Text>
                  <Text size="sm" fw={500} ff="monospace">
                    {value}
                  </Text>
                </Group>
              ))}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}

function getRoleSub(session: WalletSession) {
  if (session.primaryRole === "operator") return shortAddress(session.address);
  if (session.primaryRole === "tenant") return `Vai trò: ${session.tenantRole}`;
  return "3 đang hoạt động";
}

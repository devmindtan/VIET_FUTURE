import {
  Card,
  Group,
  Progress,
  Stack,
  Table,
  Text,
  Title,
  SimpleGrid,
} from "@mantine/core";
import {
  BankIcon,
  CoinsIcon,
  TrendDownIcon,
  TrendUpIcon,
} from "@phosphor-icons/react";
import type { OperatorStatus, TenantInfo } from "../../utils/types";
import { shortAddress, shortBytes32 } from "../../utils/display";

interface TreasuryEntry {
  tenantId: string;
  treasuryAddress: string;
  totalStake: number;
  lockedStake: number;
  pendingUnstake: number;
}

function MetricCard({
  title,
  value,
  suffix,
  icon,
}: {
  title: string;
  value: string;
  suffix?: string;
  icon: React.ReactNode;
}) {
  return (
    <Card withBorder radius="md" padding="lg">
      <Group justify="space-between" mb="xs">
        <Text size="sm" c="dimmed">
          {title}
        </Text>
        {icon}
      </Group>
      <Text fw={700} size="xl">
        {value}
        {suffix ? (
          <Text span size="sm" c="dimmed">
            {" "}
            {suffix}
          </Text>
        ) : null}
      </Text>
    </Card>
  );
}

export function Treasury({
  tenantId,
  tenants,
  operators,
}: {
  tenantId?: string;
  tenants: TenantInfo[];
  operators: OperatorStatus[];
}) {
  const scopedTenants = tenantId
    ? tenants.filter((item) => item.id === tenantId)
    : tenants;

  const stakeNumbers = operators.map(
    (operator) => Number(operator.stakeAmount.replace(" ETH", "")) || 0,
  );
  const totalStakeByView = stakeNumbers.reduce((acc, value) => acc + value, 0);
  const activeStakeByView = operators
    .filter((operator) => operator.isActive)
    .reduce(
      (acc, operator) =>
        acc + (Number(operator.stakeAmount.replace(" ETH", "")) || 0),
      0,
    );
  const pendingCount = operators.filter(
    (operator) => !operator.canUnstakeNow,
  ).length;

  const scopedTreasury: TreasuryEntry[] = scopedTenants.map((tenant) => ({
    tenantId: tenant.id,
    treasuryAddress: tenant.treasury,
    totalStake: totalStakeByView,
    lockedStake: activeStakeByView,
    pendingUnstake: pendingCount,
  }));

  const totalStake = scopedTreasury.reduce(
    (acc, item) => acc + item.totalStake,
    0,
  );
  const lockedStake = scopedTreasury.reduce(
    (acc, item) => acc + item.lockedStake,
    0,
  );
  const slashedIn = 0;
  const pendingUnstake = scopedTreasury.reduce(
    (acc, item) => acc + item.pendingUnstake,
    0,
  );

  const lockedRatio = totalStake > 0 ? (lockedStake / totalStake) * 100 : 0;

  return (
    <Stack gap="xl">
      <Title order={3}>
        {tenantId
          ? `Treasury · Tenant #${shortBytes32(tenantId)}`
          : "Treasury Overview"}
      </Title>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
        <MetricCard
          title="Tổng stake"
          value={totalStake.toString()}
          suffix="ETH"
          icon={<CoinsIcon size={18} />}
        />
        <MetricCard
          title="Stake đang khóa"
          value={lockedStake.toString()}
          suffix="ETH"
          icon={<BankIcon size={18} />}
        />
        <MetricCard
          title="Slash đã thu"
          value={slashedIn.toString()}
          suffix="ETH"
          icon={<TrendUpIcon size={18} />}
        />
        <MetricCard
          title="Pending unstake"
          value={pendingUnstake.toString()}
          suffix="ETH"
          icon={<TrendDownIcon size={18} />}
        />
      </SimpleGrid>

      <Card withBorder radius="md" padding="md">
        <Group justify="space-between" mb="xs">
          <Text fw={600}>Tỷ lệ stake khóa</Text>
          <Text size="sm" c="dimmed">
            {lockedRatio.toFixed(1)}%
          </Text>
        </Group>
        <Progress value={lockedRatio} color="teal" size="lg" radius="xl" />
      </Card>

      <Card withBorder radius="md" padding={0}>
        <Table highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Tenant</Table.Th>
              <Table.Th>Treasury</Table.Th>
              <Table.Th>Total Stake</Table.Th>
              <Table.Th>Locked</Table.Th>
              <Table.Th>Pending Unstake</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {scopedTreasury.map((item) => (
              <Table.Tr key={item.tenantId}>
                <Table.Td>#{shortBytes32(item.tenantId)}</Table.Td>
                <Table.Td>
                  <Text ff="monospace">
                    {shortAddress(item.treasuryAddress)}
                  </Text>
                </Table.Td>
                <Table.Td>{item.totalStake} ETH</Table.Td>
                <Table.Td>{item.lockedStake} ETH</Table.Td>
                <Table.Td>{item.pendingUnstake} ETH</Table.Td>
              </Table.Tr>
            ))}
            {scopedTreasury.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Text size="sm" c="dimmed">
                    Không có dữ liệu treasury theo phạm vi tenant hiện tại.
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Card>

      <Card withBorder radius="md" padding={0}>
        <Table highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Tenant</Table.Th>
              <Table.Th>Operator</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Amount</Table.Th>
              <Table.Th>Thời gian</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td colSpan={5}>
                <Text size="sm" c="dimmed">
                  SDK hiện chưa có API list slash payout theo thời gian.
                </Text>
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Card>
    </Stack>
  );
}

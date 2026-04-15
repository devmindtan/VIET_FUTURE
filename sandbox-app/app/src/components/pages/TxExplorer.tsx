import { useState } from "react";
import {
  Stack,
  Title,
  Group,
  Button,
  TextInput,
  Card,
  Text,
  Badge,
  Divider,
  Code,
  JsonInput,
  Loader,
  Center,
} from "@mantine/core";
import { MagnifyingGlassIcon, ArrowSquareOutIcon } from "@phosphor-icons/react";

interface TxResult {
  hash: string;
  block: number;
  from: string;
  to: string;
  status: "SUCCESS" | "FAILED" | "PENDING";
  method: string;
  gas_used: string;
  value: string;
  decoded: Record<string, unknown>;
}

const STATUS_COLOR: Record<string, string> = {
  SUCCESS: "teal",
  FAILED: "red",
  PENDING: "yellow",
};

export function TxExplorer({ tenantId }: { tenantId?: string }) {
  const [hash, setHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TxResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    const txHash = hash.trim();
    if (!txHash) {
      setError("Vui lòng nhập transaction hash.");
      setResult(null);
      return;
    }

    setLoading(true);
    setResult(null);
    setError("Chưa tích hợp API tra cứu transaction.");
    setLoading(false);
  };

  return (
    <Stack gap="xl">
      <Title order={3}>
        {tenantId
          ? `Transaction Explorer · Tenant #${tenantId}`
          : "Transaction Explorer"}
      </Title>

      <Card withBorder radius="md" padding="md">
        <Group gap="sm">
          <TextInput
            flex={1}
            placeholder="Nhập tx hash: 0x..."
            ff="monospace"
            value={hash}
            onChange={(e) => setHash(e.currentTarget.value)}
          />
          <Button
            leftSection={<MagnifyingGlassIcon size={16} />}
            loading={loading}
            onClick={handleSearch}
          >
            Tìm kiếm
          </Button>
        </Group>
      </Card>

      {loading && (
        <Center py="xl">
          <Loader color="teal" />
        </Center>
      )}

      {error && (
        <Card withBorder radius="md" padding="md" c="red">
          <Text size="sm">{error}</Text>
        </Card>
      )}

      {result && !loading && (
        <Stack gap="md">
          {/* Header */}
          <Card withBorder radius="md" padding="md">
            <Group justify="space-between" mb="md">
              <Group gap="sm">
                <Badge
                  color={STATUS_COLOR[result.status]}
                  size="md"
                  variant="filled"
                >
                  {result.status}
                </Badge>
                <Badge size="md" variant="outline" color="blue">
                  {result.method}
                </Badge>
              </Group>
              <Button
                size="xs"
                variant="subtle"
                rightSection={<ArrowSquareOutIcon size={14} />}
                component="a"
                href={`https://etherscan.io/tx/${result.hash}`}
                target="_blank"
              >
                Mở ngoài
              </Button>
            </Group>

            <Stack gap="xs">
              {[
                ["Tx Hash", result.hash],
                ["Block", result.block.toLocaleString()],
                ["Từ", result.from],
                ["Đến", result.to],
                ["Gas đã dùng", result.gas_used],
                ["Giá trị", result.value],
              ].map(([k, v]) => (
                <Group key={k as string} justify="space-between" wrap="nowrap">
                  <Text size="sm" c="dimmed" miw={120}>
                    {k}
                  </Text>
                  <Code style={{ textAlign: "right", wordBreak: "break-all" }}>
                    {v as string}
                  </Code>
                </Group>
              ))}
            </Stack>
          </Card>

          {/* Decoded input */}
          <Card withBorder radius="md" padding="md">
            <Text fw={600} mb="sm">
              Dữ liệu đã giải mã ({result.method})
            </Text>
            <Divider mb="md" />
            <JsonInput
              readOnly
              value={JSON.stringify(result.decoded, null, 2)}
              minRows={6}
              ff="monospace"
              autosize
            />
          </Card>
        </Stack>
      )}
    </Stack>
  );
}

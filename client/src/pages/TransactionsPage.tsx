import { useState } from "react";
import {
  Container,
  Title,
  Tabs,
  Box,
  Affix,
  ActionIcon,
  Transition,
} from "@mantine/core";
import {
  IconReceipt,
  IconChartBar,
  IconWallet,
  IconPlus,
} from "@tabler/icons-react";
import { useWindowScroll } from "@mantine/hooks";
import TransactionsTab from "@/components/transactions/TransactionsTab";
import StatisticsTab from "@/components/transactions/StatisticsTab";
import BudgetsTab from "@/components/transactions/BudgetsTab";

export default function TransactionsPage() {
  const [activeTab, setActiveTab] = useState<string | null>("transactions");
  const [scroll] = useWindowScroll();

  return (
    <Container size="xl" py="xl">
      <Title order={2} mb="lg">
        가계부
      </Title>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="budgets" leftSection={<IconWallet size={16} />}>
            예산
          </Tabs.Tab>
          <Tabs.Tab
            value="transactions"
            leftSection={<IconReceipt size={16} />}
          >
            거래내역
          </Tabs.Tab>
          <Tabs.Tab value="statistics" leftSection={<IconChartBar size={16} />}>
            통계
          </Tabs.Tab>
        </Tabs.List>

        <Box mt="md">
          <Tabs.Panel value="transactions">
            <TransactionsTab />
          </Tabs.Panel>

          <Tabs.Panel value="statistics">
            <StatisticsTab />
          </Tabs.Panel>

          <Tabs.Panel value="budgets">
            <BudgetsTab />
          </Tabs.Panel>
        </Box>
      </Tabs>

      {/* 빠른 추가 버튼 - 거래내역 탭에서만 표시 */}
      {activeTab === "transactions" && (
        <Affix position={{ bottom: 20, right: 20 }}>
          <Transition transition="slide-up" mounted={scroll.y > 100}>
            {(transitionStyles) => (
              <ActionIcon
                size="xl"
                radius="xl"
                variant="filled"
                style={transitionStyles}
                onClick={() => {
                  // 거래 추가 모달 열기를 위한 이벤트 디스패치
                  window.dispatchEvent(new CustomEvent("openTransactionModal"));
                }}
              >
                <IconPlus size={24} />
              </ActionIcon>
            )}
          </Transition>
        </Affix>
      )}
    </Container>
  );
}

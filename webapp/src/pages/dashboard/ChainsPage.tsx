import { Typography, Card } from 'antd'
import styled from 'styled-components'

const { Title, Paragraph } = Typography

const PageContainer = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`

const PageHeader = styled.div`
  margin-bottom: 24px;
`

export default function ChainsPage() {
  return (
    <PageContainer>
      <PageHeader>
        <Title level={2}>Chains</Title>
        <Paragraph>Create and manage prompt chains</Paragraph>
      </PageHeader>

      <Card>
        <p>Chain management features will be implemented here</p>
      </Card>
    </PageContainer>
  )
}

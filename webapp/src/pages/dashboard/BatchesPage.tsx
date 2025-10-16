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

export default function BatchesPage() {
  return (
    <PageContainer>
      <PageHeader>
        <Title level={2}>Batches</Title>
        <Paragraph>Manage batch operations and processing</Paragraph>
      </PageHeader>

      <Card>
        <p>Batch operations will be managed here</p>
      </Card>
    </PageContainer>
  )
}

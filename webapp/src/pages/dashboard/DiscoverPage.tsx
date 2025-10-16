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

export default function DiscoverPage() {
  return (
    <PageContainer>
      <PageHeader>
        <Title level={2}>Discover</Title>
        <Paragraph>Explore and discover new prompts and templates</Paragraph>
      </PageHeader>

      <Card>
        <p>Discovery features will be implemented here</p>
      </Card>
    </PageContainer>
  )
}

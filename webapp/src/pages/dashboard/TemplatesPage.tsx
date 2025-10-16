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

export default function TemplatesPage() {
  return (
    <PageContainer>
      <PageHeader>
        <Title level={2}>Templates</Title>
        <Paragraph>Manage and create prompt templates</Paragraph>
      </PageHeader>

      <Card>
        <p>Template management features will be implemented here</p>
      </Card>
    </PageContainer>
  )
}

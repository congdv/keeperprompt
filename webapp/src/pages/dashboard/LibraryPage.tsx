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

export default function LibraryPage() {
  return (
    <PageContainer>
      <PageHeader>
        <Title level={2}>Library</Title>
        <Paragraph>Browse and manage your prompt library</Paragraph>
      </PageHeader>

      <Card>
        <p>Library content will be displayed here</p>
      </Card>
    </PageContainer>
  )
}

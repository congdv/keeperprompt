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

export default function DatabasePage() {
  return (
    <PageContainer>
      <PageHeader>
        <Title level={2}>Database</Title>
        <Paragraph>Manage your database and data sources</Paragraph>
      </PageHeader>

      <Card>
        <p>Database management interface will be implemented here</p>
      </Card>
    </PageContainer>
  )
}

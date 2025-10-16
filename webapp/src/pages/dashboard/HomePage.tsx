import { Typography, Card, Row, Col } from 'antd'
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

export default function HomePage() {
  return (
    <PageContainer>
      <PageHeader>
        <Title level={2}>Home</Title>
        <Paragraph>Welcome to Keeper Prompt Dashboard</Paragraph>
      </PageHeader>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card title="Quick Actions" bordered={false}>
            <p>Your quick actions will appear here</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card title="Recent Activity" bordered={false}>
            <p>Recent activity will be displayed here</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card title="Statistics" bordered={false}>
            <p>Statistics and metrics will be shown here</p>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  )
}

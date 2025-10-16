import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Button, Avatar, Dropdown } from 'antd'
import {
  HomeOutlined,
  CompassOutlined,
  BookOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  InboxOutlined,
  LinkOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined
} from '@ant-design/icons'
import styled from 'styled-components'
import { useAuth } from '../../context/AuthContext'

const { Sider, Content } = Layout

const StyledLayout = styled(Layout)`
  min-height: 100vh;
  background: #fafafa;
`

const StyledSider = styled(Sider)`
  && {
    background: #ffffff;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.04);
    
    .ant-layout-sider-children {
      display: flex;
      flex-direction: column;
    }
  }
`

const Logo = styled.div`
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  font-size: 20px;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
  
  &::before {
    content: '';
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border-radius: 6px;
    margin-right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`

const MenuSection = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
`

const MenuTitle = styled.div`
  padding: 16px 24px 8px;
  font-size: 11px;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 1.2px;
`

const StyledMenu = styled(Menu)`
  && {
    border: none;
    background: transparent;
    
    .ant-menu-item {
      margin: 4px 8px;
      border-radius: 6px;
      height: 40px;
      line-height: 40px;
      
      &:hover {
        background: #f5f5f5;
      }
      
      &.ant-menu-item-selected {
        background: #e8f1ff;
        color: #3b82f6;
        font-weight: 500;
        
        &::after {
          display: none;
        }
      }
    }
    
    .ant-menu-item-icon {
      font-size: 16px;
    }
  }
`

const UserSection = styled.div`
  padding: 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  
  &:hover {
    background: #f5f5f5;
  }
`

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const UserName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const UserEmail = styled.div`
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const StyledContent = styled(Content)`
  background: #fafafa;
`

const ToggleButton = styled(Button) <{ $collapsed: boolean }>`
  && {
    position: fixed;
    top: 16px;
    left: ${props => props.$collapsed ? '88px' : '216px'};
    z-index: 1000;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    transition: left 0.2s;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    
    @media (min-width: 768px) {
      display: none;
    }
  }
`

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/profile')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/settings')
    },
    {
      key: 'divider',
      type: 'divider' as const
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout
    }
  ]

  const menuItems = [
    {
      key: '/dashboard',
      icon: <HomeOutlined />,
      label: 'Home'
    },
    {
      key: '/dashboard/discover',
      icon: <CompassOutlined />,
      label: 'Discover'
    },
    {
      key: '/dashboard/library',
      icon: <BookOutlined />,
      label: 'Library'
    },
    {
      key: '/dashboard/templates',
      icon: <FileTextOutlined />,
      label: 'Templates'
    },
    {
      key: '/dashboard/database',
      icon: <DatabaseOutlined />,
      label: 'Database'
    },
    {
      key: '/dashboard/batches',
      icon: <InboxOutlined />,
      label: 'Batches'
    },
    {
      key: '/dashboard/chains',
      icon: <LinkOutlined />,
      label: 'Chains'
    }
  ]

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  return (
    <StyledLayout>
      <StyledSider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        collapsedWidth={80}
        width={240}
        trigger={null}
      >
        <Logo>
          {!collapsed && 'Keeper Prompt'}
        </Logo>

        <MenuSection>
          <StyledMenu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
          />
        </MenuSection>

        {!collapsed && (
          <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="topRight">
            <UserSection>
              <Avatar icon={<UserOutlined />} />
              <UserInfo>
                <UserName>{user?.email?.split('@')[0] || 'User'}</UserName>
                <UserEmail>{user?.email || 'user@example.com'}</UserEmail>
              </UserInfo>
            </UserSection>
          </Dropdown>
        )}

        {collapsed && (
          <UserSection style={{ justifyContent: 'center' }}>
            <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="topRight">
              <Avatar icon={<UserOutlined />} />
            </Dropdown>
          </UserSection>
        )}
      </StyledSider>

      <ToggleButton
        $collapsed={collapsed}
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
      />

      <StyledContent>
        <Outlet />
      </StyledContent>
    </StyledLayout>
  )
}

import React, { useEffect } from 'react'
import { useRoutes } from 'react-router-dom'
// eslint-disable-next-line no-console
console.info('[theme-routes-module] loaded')

// routes
import MainRoutes, { AuthRoutes, PublicFlowRoutes } from './MainRoutes'
import CanvasRoutes from '@universo/spaces-frt/src/entry/CanvasRoutes'
import ChatbotRoutes from './ChatbotRoutes'
import config from '../config'

// Import new MUI routes to replace main routes
import { MainRoutesMUI } from '@universo/template-mui'

// ==============================|| ROUTING RENDER ||============================== //

export default function ThemeRoutes() {
    const routeTree = [AuthRoutes, MainRoutesMUI, MainRoutes, CanvasRoutes, ChatbotRoutes, PublicFlowRoutes]
    const sanitizedRoutes = routeTree.filter(Boolean)

    const Trace = ({ name, children }) => {
        useEffect(() => {
            // eslint-disable-next-line no-console
            console.info(`[route-trace:m]`, name)
            return () => {
                // eslint-disable-next-line no-console
                console.info(`[route-trace:um]`, name)
            }
        }, [name])
        // eslint-disable-next-line no-console
        console.info(`[route-trace:r]`, name)
        return children
    }

    const wrapRoute = (route, prefix = '') => {
        if (!route) return route
        const path = `${prefix}${route.path || ''}` || '(index)'
        const wrapped = { ...route }
        if (route.element) {
            wrapped.element = (
                <Trace name={path}>
                    {route.element}
                </Trace>
            )
        }
        if (Array.isArray(route.children)) {
            // FIX: Don't add trailing slash if path already ends with '/' or is empty
            const childPrefix = path === '/' ? '/' : path.endsWith('/') ? path : `${path}/`
            wrapped.children = route.children.map((child) => wrapRoute(child, childPrefix))
        }
        return wrapped
    }

    const wrappedRoutes = sanitizedRoutes.map((r) => wrapRoute(r))

    if (typeof window !== 'undefined') {
        // eslint-disable-next-line no-console
        console.info('[theme-routes]', {
            basename: config.basename,
            total: routeTree.length,
            sanitized: sanitizedRoutes.length,
            paths: wrappedRoutes.map((route) => route?.path ?? '(unknown)')
        })
    }

    return useRoutes(wrappedRoutes)
}

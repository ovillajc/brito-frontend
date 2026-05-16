'use client'

import React from 'react'
import { UsersTable } from '../components/organisms/UsersTable'
import { motion } from 'framer-motion'

export default function UsersListPage() {
  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        <h1 className="text-3xl font-bold text-stone-900 dark:text-zinc-100 tracking-tight">
          Administración de Usuarios
        </h1>
        <p className="text-stone-500 dark:text-zinc-400">
          Control centralizado de identidades, roles y permisos del personal.
        </p>
      </motion.div>

      <UsersTable />
    </div>
  )
}

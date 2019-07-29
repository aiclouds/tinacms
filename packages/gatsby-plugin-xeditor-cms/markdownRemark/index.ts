import { Form, FormOptions } from '@forestryio/cms'
import { useCMSForm } from '@forestryio/cms-react'
import {
  ERROR_MISSING_CMS_GATSBY,
  ERROR_MISSING_REMARK_ID,
  ERROR_MISSING_REMARK_PATH,
} from '../errors'

interface RemarkNode {
  id: string
  frontmatter: any
  html: string
  [key: string]: any
}

export function useRemarkForm(
  markdownRemark: RemarkNode,
  formOverrrides: Partial<FormOptions<any>> = {}
) {
  if (typeof markdownRemark.id === 'undefined') {
    throw new Error(ERROR_MISSING_REMARK_ID)
  }
  // TODO: Only required when saving to local filesystem.
  if (typeof markdownRemark.fileAbsolutePath === 'undefined') {
    throw new Error(ERROR_MISSING_REMARK_PATH)
  }
  try {
    return useCMSForm({
      name: `markdownRemark:${markdownRemark.id}`,
      initialValues: markdownRemark,
      fields: generateFields(markdownRemark),
      onSubmit(data) {
        if (process.env.NODE_ENV === 'development') {
          return writeToDisk(data)
        } else {
          console.log('Not supported')
        }
      },
      ...formOverrrides,
    })
  } catch (e) {
    throw new Error(ERROR_MISSING_CMS_GATSBY)
  }
}

function generateFields(post: RemarkNode) {
  let frontmatterFields = Object.keys(post.frontmatter).map(key => ({
    component: 'text',
    name: `frontmatter.${key}`,
  }))

  return [...frontmatterFields, { component: 'text', name: 'html' }]
}

interface RemarkFormProps {
  remark: RemarkNode
  children(renderProps: { form: Form; markdownRemark: any }): JSX.Element
}

export function RemarkForm({ remark, children }: RemarkFormProps) {
  let [markdownRemark, form] = useRemarkForm(remark)

  return children({ form, markdownRemark })
}

function writeToDisk(data: any) {
  // @ts-ignore
  return fetch('http://localhost:4567/markdownRemark', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(data),
  })
    .then(response => {
      console.log(response.json())
    })
    .catch(e => {
      console.error(e)
    })
}
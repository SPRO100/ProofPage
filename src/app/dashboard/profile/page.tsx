import { cookies } from 'next/headers'
import styles from '../dashboard.module.css'

const copy = {
  en: { eyebrow:'Profile', title:'Edit your public identity.', intro:'Changes appear on your public page after saving.', save:'Save changes', upload:'Upload photo', uploadHelp:'JPG, PNG or WebP · max 3 MB', name:'Display name', location:'Location', bioEn:'Bio in English', bioRu:'Bio in Russian', bioRuPlaceholder:'Add your Russian bio', twitter:'X / Twitter', linkedin:'LinkedIn', website:'Personal website' },
  ru: { eyebrow:'Профиль', title:'Настройте публичный образ.', intro:'После сохранения изменения появятся на публичной странице.', save:'Сохранить изменения', upload:'Загрузить фото', uploadHelp:'JPG, PNG или WebP · до 3 МБ', name:'Отображаемое имя', location:'Город', bioEn:'Описание на английском', bioRu:'Описание на русском', bioRuPlaceholder:'Добавьте описание на русском', twitter:'X / Twitter', linkedin:'LinkedIn', website:'Личный сайт' },
} as const

export default async function ProfileEditorPage() {
  const locale = (await cookies()).get('proofpage-locale')?.value === 'ru' ? 'ru' : 'en'
  const t = copy[locale]
  return <main className={styles.content}><div className={styles.pageHead}><div><p className={styles.eyebrow}>{t.eyebrow}</p><h1>{t.title}</h1><p>{t.intro}</p></div><button className={styles.primaryButton}>{t.save}</button></div><section className={styles.formPanel}><div className={styles.avatarEditor}><div>AM</div><button>{t.upload}</button><span>{t.uploadHelp}</span></div><div className={styles.formGrid}><label>{t.name}<input defaultValue="Alex Morgan" /></label><label>{t.location}<input defaultValue="Tallinn, Estonia" /></label><label className={styles.full}>{t.bioEn}<textarea defaultValue="I build focused software for small teams. Less dashboard theatre, more useful work." /></label><label className={styles.full}>{t.bioRu}<textarea placeholder={t.bioRuPlaceholder} /></label><label>{t.twitter}<input placeholder="https://x.com/username" /></label><label>{t.linkedin}<input placeholder="https://linkedin.com/in/username" /></label><label className={styles.full}>{t.website}<input placeholder="https://yourwebsite.com" /></label></div></section></main>
}
